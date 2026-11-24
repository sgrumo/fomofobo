import { expectRawStatus, expectStatus } from "e2e-kit/assertions"
import { publishedAppUrl } from "e2e-kit/env"
import { describe, expect, it } from "vitest"
import { z } from "zod"

import { buildAccountSeed, seedAccount, signIn } from "../auth/utils"
import {
    authorize,
    buildAuthorizeQuery,
    buildPkce,
    redirectUrlOf,
    registerClient,
    signedQueryOf,
} from "./utils"

describe("GET /api/auth/oauth2/authorize", () => {
    it("sends a browser with no session to the OAuth login page with a signed query", async () => {
        const client = await registerClient()
        const state = crypto.randomUUID()

        const res = await authorize(buildAuthorizeQuery(client, await buildPkce(), state))
        expectStatus(res, 302)

        const location = new URL(
            z.string().parse(res.headers.location),
            publishedAppUrl(),
        )
        expect(location.pathname).toBe("/backoffice/oauth-login")
        expect({
            clientId: location.searchParams.get("client_id"),
            state: location.searchParams.get("state"),
            signed: location.searchParams.has("sig"),
        }).toStrictEqual({ clientId: client.clientId, state, signed: true })
    })

    it("continues to the consent page once the account signs in on the login page", async () => {
        const seed = buildAccountSeed("admin")
        await seedAccount(seed)
        const client = await registerClient()
        const authorization = await authorize(
            buildAuthorizeQuery(client, await buildPkce(), crypto.randomUUID()),
        )
        expectStatus(authorization, 302)

        const res = await signIn({
            email: seed.email,
            password: seed.password,
            oauth_query: signedQueryOf(z.string().parse(authorization.headers.location)),
        })
        expectStatus(res, 200)

        const consentUrl = new URL(redirectUrlOf(res.data), publishedAppUrl())
        expect(consentUrl.pathname).toBe("/backoffice/oauth-consent")
        expect(consentUrl.searchParams.get("client_id")).toBe(client.clientId)
    })

    it("rejects a forged login query", async () => {
        const seed = buildAccountSeed("admin")
        await seedAccount(seed)
        const client = await registerClient()
        const authorization = await authorize(
            buildAuthorizeQuery(client, await buildPkce(), crypto.randomUUID()),
        )
        expectStatus(authorization, 302)
        const forged = new URLSearchParams(
            signedQueryOf(z.string().parse(authorization.headers.location)),
        )
        forged.set("redirect_uri", "https://attacker.example/callback")

        const res = await signIn({
            email: seed.email,
            password: seed.password,
            oauth_query: forged.toString(),
        })

        expectRawStatus(res, 400)
    })

    it("refuses a client metadata document outside claude.ai before it fetches it", async () => {
        const client = {
            clientId: "https://client.e2e.test/oauth/metadata",
            redirectUri: "https://client.e2e.test/callback",
        }

        const res = await authorize(
            buildAuthorizeQuery(client, await buildPkce(), crypto.randomUUID()),
        )

        expectRawStatus(res, 400)
        expect(res.data).toMatchObject({
            error: "invalid_client",
            error_description:
                "client_id URL is not permitted by the server's fetch policy",
        })
    })
})
