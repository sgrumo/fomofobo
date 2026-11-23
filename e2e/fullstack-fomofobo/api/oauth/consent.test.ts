import { expectApiError, expectStatus } from "e2e-kit/assertions"
import { describe, expect, it } from "vitest"

import { answerConsent, reachConsentAs, redirectUrlOf } from "./utils"

describe("POST /api/auth/oauth2/consent", () => {
    it("sends an Admin who grants the access back to the client with a code and the state", async () => {
        const consent = await reachConsentAs("admin")

        const res = await answerConsent(consent.cookie, true, consent.consentQuery)
        expectStatus(res, 200)

        const redirect = new URL(redirectUrlOf(res.data))
        expect({
            target: `${redirect.origin}${redirect.pathname}`,
            state: redirect.searchParams.get("state"),
            hasCode: redirect.searchParams.has("code"),
        }).toStrictEqual({
            target: consent.client.redirectUri,
            state: consent.state,
            hasCode: true,
        })
    })

    it("sends an Admin who denies the access back to the client with access_denied", async () => {
        const consent = await reachConsentAs("admin")

        const res = await answerConsent(consent.cookie, false, consent.consentQuery)
        expectStatus(res, 200)

        const redirect = new URL(redirectUrlOf(res.data))
        expect({
            error: redirect.searchParams.get("error"),
            hasCode: redirect.searchParams.has("code"),
        }).toStrictEqual({ error: "access_denied", hasCode: false })
    })

    it("refuses an Organizer", async () => {
        const consent = await reachConsentAs("organizer")

        const res = await answerConsent(consent.cookie, true, consent.consentQuery)

        expectApiError(res, 403, { code: "ForbiddenAction" })
    })

    it("refuses a request with no session", async () => {
        const consent = await reachConsentAs("admin")

        const res = await answerConsent("", true, consent.consentQuery)

        expectApiError(res, 401, { code: "Unauthenticated" })
    })
})
