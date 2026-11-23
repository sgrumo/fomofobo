import type { AccountCredentials } from "models"
import { HttpStatus } from "models"
import { Result } from "shared/result"
import { z } from "zod"

import { SIGN_IN_PATH } from "./sign-in"

const OAUTH_BASE_PATH = "/api/auth/oauth2"

export const OAUTH_PATHS = {
    authorize: `${OAUTH_BASE_PATH}/authorize`,
    token: `${OAUTH_BASE_PATH}/token`,
    consent: `${OAUTH_BASE_PATH}/consent`,
    revoke: `${OAUTH_BASE_PATH}/revoke`,
    register: `${OAUTH_BASE_PATH}/register`,
    publicClient: `${OAUTH_BASE_PATH}/public-client`,
    jwks: "/api/auth/jwks",
} as const

const redirectBodySchema = z.object({ redirect: z.literal(true), url: z.string() })

const publicClientSchema = z.object({
    client_name: z.string().optional(),
    client_uri: z.string().optional(),
})

export type OauthPublicClient = z.infer<typeof publicClientSchema>

export type OauthStepOutcome =
    | { kind: "redirect"; url: string }
    | { kind: "invalid-credentials" }
    | { kind: "failed" }

/**
 * @description Maps the answer of an OAuth step to the next page of the browser
 * @param response Answer of the sign-in or of the consent
 */
const toStepOutcome = async (response: Response): Promise<OauthStepOutcome> => {
    if (!response.ok) {
        return response.status === HttpStatus.Unauthorized
            ? { kind: "invalid-credentials" }
            : { kind: "failed" }
    }
    const json = await Result.tryAsync(() => response.json())
    const body = json.success ? redirectBodySchema.safeParse(json.value) : undefined
    return body?.success ? { kind: "redirect", url: body.data.url } : { kind: "failed" }
}

/**
 * @description Sends the JSON body of an OAuth step and maps its answer
 * @param path Endpoint of the step
 * @param body Fields sent, the signed authorization query included
 */
const postOauthStep = async (path: string, body: object): Promise<OauthStepOutcome> => {
    const response = await Result.tryAsync(() =>
        fetch(path, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        }),
    )
    return response.success ? await toStepOutcome(response.value) : { kind: "failed" }
}

/**
 * @description Sends the email and password together with the signed authorization query,
 * and returns the page that the authorization continues on
 * @param credentials Email and password typed in the login form
 * @param oauthQuery Signed query that the authorize step put in the URL of the page
 * @remarks Answers `invalid-credentials` for a blocked account too, like the sign-in of
 * the backoffice
 */
export const signInForOauth = async (
    credentials: AccountCredentials,
    oauthQuery: string,
): Promise<OauthStepOutcome> =>
    await postOauthStep(SIGN_IN_PATH, { ...credentials, oauth_query: oauthQuery })

/**
 * @description Sends the answer of the account to the consent request, and returns the
 * redirect back to the client
 * @param accept True to grant the access
 * @param oauthQuery Signed query that the authorize step put in the URL of the page
 */
export const answerOauthConsent = async (
    accept: boolean,
    oauthQuery: string,
): Promise<OauthStepOutcome> =>
    await postOauthStep(OAUTH_PATHS.consent, { accept, oauth_query: oauthQuery })

/**
 * @description Fetches the public name and site of the client that asks for the access
 * @param clientId Client id of the authorization query
 * @throws When the endpoint answers an error status
 */
export const fetchOauthPublicClient = async (
    clientId: string,
): Promise<OauthPublicClient> => {
    const response = await fetch(
        `${OAUTH_PATHS.publicClient}?${new URLSearchParams({ client_id: clientId }).toString()}`,
    )
    if (!response.ok) {
        throw new Error(`Public client answered ${response.status}`)
    }
    return publicClientSchema.parse(await response.json())
}
