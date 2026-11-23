import { expectRawStatus, expectStatus } from "e2e-kit/assertions"
import { publishedAppUrl } from "e2e-kit/env"
import { describe, expect, it } from "vitest"

import {
    answerConsent,
    authorizeAdmin,
    claimsOf,
    mcpResourceUrl,
    reachConsentAs,
    redirectUrlOf,
    requestToken,
    tokenResponseSchema,
} from "./utils"

describe("POST /api/auth/oauth2/token", () => {
    it("exchanges the code for an access token bound to the MCP endpoint and the account", async () => {
        const { account, tokens } = await authorizeAdmin()

        expect(tokens).toMatchObject({ token_type: "Bearer" })
        expect(claimsOf(tokens.access_token)).toMatchObject({
            sub: account.id,
            aud: expect.arrayContaining([mcpResourceUrl()]),
            iss: `${publishedAppUrl()}/api/auth`,
        })
    })

    it("refuses a code with a wrong PKCE verifier", async () => {
        const consent = await reachConsentAs("admin")
        const answer = await answerConsent(consent.cookie, true, consent.consentQuery)
        expectStatus(answer, 200)

        const res = await requestToken({
            grant_type: "authorization_code",
            code: new URL(redirectUrlOf(answer.data)).searchParams.get("code") ?? "",
            redirect_uri: consent.client.redirectUri,
            client_id: consent.client.clientId,
            code_verifier: `${consent.pkce.verifier}x`,
            resource: mcpResourceUrl(),
        })

        expectRawStatus(res, 401)
        expect(res.data).toStrictEqual({
            error: "invalid_request",
            error_description: "code verification failed",
        })
    })

    it("rotates the refresh token on a refresh", async () => {
        const { client, tokens } = await authorizeAdmin()

        const res = await requestToken({
            grant_type: "refresh_token",
            refresh_token: tokens.refresh_token,
            client_id: client.clientId,
            resource: mcpResourceUrl(),
        })
        expectStatus(res, 200)

        const refreshed = tokenResponseSchema.parse(res.data)
        expect(refreshed.refresh_token).not.toBe(tokens.refresh_token)
        expect(refreshed.access_token).not.toBe(tokens.access_token)
    })
})
