import { faker } from "@faker-js/faker"
import axios from "axios"
import { expectStatus } from "e2e-kit/assertions"
import { publishedAppUrl } from "e2e-kit/env"
import type { Account, AccountRole } from "models"
import { z } from "zod"

import { buildAccountSeed, seedAccount, signIn, toCookieHeader } from "../auth/utils"

const OAUTH_PATH = "/api/auth/oauth2"

const REDIRECT_URI = "https://client.e2e.test/callback"

const registeredClientSchema = z.object({ client_id: z.string() })
const redirectBodySchema = z.object({ redirect: z.literal(true), url: z.string() })
export const tokenResponseSchema = z.object({
    access_token: z.string(),
    refresh_token: z.string(),
    token_type: z.string(),
    expires_in: z.number(),
    scope: z.string(),
})

export interface OauthClient {
    clientId: string
    redirectUri: string
}

export interface Pkce {
    verifier: string
    challenge: string
}

/**
 * @description Returns the URL of the MCP endpoint, the resource every token names
 */
export const mcpResourceUrl = (): string => `${publishedAppUrl()}/api/mcp`

/**
 * @description Builds the PKCE verifier of an authorization and its S256 challenge
 */
export const buildPkce = async (): Promise<Pkce> => {
    const verifier = Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString(
        "base64url",
    )
    const digest = await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(verifier),
    )
    return { verifier, challenge: Buffer.from(digest).toString("base64url") }
}

/**
 * @description Persists a public OAuth client through the registration that the app
 * serves under `APP_ENV=test`
 */
export const registerClient = async (): Promise<OauthClient> => {
    const res = await axios.post(
        `${publishedAppUrl()}${OAUTH_PATH}/register`,
        {
            client_name: faker.company.name(),
            redirect_uris: [REDIRECT_URI],
            token_endpoint_auth_method: "none",
            grant_types: ["authorization_code", "refresh_token"],
            response_types: ["code"],
        },
        { validateStatus: () => true },
    )
    expectStatus(res, 201)
    return {
        clientId: registeredClientSchema.parse(res.data).client_id,
        redirectUri: REDIRECT_URI,
    }
}

/**
 * @description Builds the query of an authorization request for the MCP resource
 * @param client Client that asks
 * @param pkce PKCE pair of the request
 * @param state Opaque value that the redirect carries back
 */
export const buildAuthorizeQuery = (
    client: OauthClient,
    pkce: Pkce,
    state: string,
): URLSearchParams =>
    new URLSearchParams({
        response_type: "code",
        client_id: client.clientId,
        redirect_uri: client.redirectUri,
        scope: "openid offline_access",
        state,
        code_challenge: pkce.challenge,
        code_challenge_method: "S256",
        resource: mcpResourceUrl(),
    })

/**
 * @description Sends an authorization request with no session, as a browser navigation,
 * and returns the response
 * @param query Query of the request
 */
export const authorize = async (query: URLSearchParams) =>
    await axios.get(`${publishedAppUrl()}${OAUTH_PATH}/authorize?${query.toString()}`, {
        // The library answers a JSON redirect, not a 302, to an `Accept: application/json` fetch
        headers: { Accept: "text/html" },
        maxRedirects: 0,
        validateStatus: () => true,
    })

/**
 * @description Returns the query of a page URL, which the next OAuth step sends back
 * @param url URL of the login or the consent page
 */
export const signedQueryOf = (url: string): string =>
    new URL(url, publishedAppUrl()).search.slice(1)

/**
 * @description Returns the redirect URL of a JSON answer of an OAuth step
 * @param data Body of the answer
 */
export const redirectUrlOf = (data: unknown): string => redirectBodySchema.parse(data).url

/**
 * @description Sends the answer of the session to the consent request and returns the response
 * @param cookie Session cookies
 * @param accept True to grant the access
 * @param oauthQuery Signed query of the consent page
 */
export const answerConsent = async (
    cookie: string,
    accept: boolean,
    oauthQuery: string,
) =>
    await axios.post(
        `${publishedAppUrl()}${OAUTH_PATH}/consent`,
        { accept, oauth_query: oauthQuery },
        {
            headers: { Cookie: cookie, Origin: publishedAppUrl() },
            validateStatus: () => true,
        },
    )

/**
 * @description Sends a form to the token endpoint and returns the response
 * @param form Fields of the token request
 */
export const requestToken = async (form: Record<string, string>) =>
    await axios.post(
        `${publishedAppUrl()}${OAUTH_PATH}/token`,
        new URLSearchParams(form),
        {
            validateStatus: () => true,
        },
    )

/**
 * @description Seeds an account of the role and walks the OAuth flow up to the consent page
 * @param role Role of the account
 */
export const reachConsentAs = async (
    role: AccountRole,
): Promise<{
    account: Account
    client: OauthClient
    pkce: Pkce
    state: string
    cookie: string
    consentQuery: string
}> => {
    const seed = buildAccountSeed(role)
    const account = await seedAccount(seed)
    const client = await registerClient()
    const pkce = await buildPkce()
    const state = crypto.randomUUID()

    const authorization = await authorize(buildAuthorizeQuery(client, pkce, state))
    expectStatus(authorization, 302)
    const loginUrl = z.string().parse(authorization.headers.location)

    const session = await signIn({
        email: seed.email,
        password: seed.password,
        oauth_query: signedQueryOf(loginUrl),
    })
    expectStatus(session, 200)

    return {
        account,
        client,
        pkce,
        state,
        cookie: toCookieHeader(session.headers["set-cookie"]),
        consentQuery: signedQueryOf(redirectUrlOf(session.data)),
    }
}

/**
 * @description Seeds an Admin, grants the access of a new client, and returns the tokens
 */
export const authorizeAdmin = async (): Promise<{
    account: Account
    client: OauthClient
    tokens: z.infer<typeof tokenResponseSchema>
}> => {
    const consent = await reachConsentAs("admin")
    const answer = await answerConsent(consent.cookie, true, consent.consentQuery)
    expectStatus(answer, 200)
    const code = new URL(redirectUrlOf(answer.data)).searchParams.get("code") ?? ""

    const token = await requestToken({
        grant_type: "authorization_code",
        code,
        redirect_uri: consent.client.redirectUri,
        client_id: consent.client.clientId,
        code_verifier: consent.pkce.verifier,
        resource: mcpResourceUrl(),
    })
    expectStatus(token, 200)

    return {
        account: consent.account,
        client: consent.client,
        tokens: tokenResponseSchema.parse(token.data),
    }
}

/**
 * @description Returns the claims of a JWT, with no signature check
 * @param token JWT read
 */
export const claimsOf = (token: string): Record<string, unknown> =>
    z
        .record(z.string(), z.unknown())
        .parse(
            JSON.parse(
                Buffer.from(token.split(".")[1] ?? "", "base64url").toString("utf8"),
            ),
        )
