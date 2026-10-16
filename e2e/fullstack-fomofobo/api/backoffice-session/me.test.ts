import { expectApiError, expectRawStatus, expectStatus } from "e2e-kit/assertions"
import { describe, expect, it } from "vitest"

import { buildAccountSeed, seedAccount, signIn, toCookieHeader } from "../auth/utils"
import { getMe } from "./api"

describe("GET /api/backoffice/me", () => {
    it("answers the account of the session", async () => {
        const seed = buildAccountSeed("admin")
        const account = await seedAccount(seed)
        const session = await signIn({ email: seed.email, password: seed.password })
        expectRawStatus(session, 200)

        const res = await getMe({
            headers: { Cookie: toCookieHeader(session.headers["set-cookie"]) },
        })

        expectStatus(res, 200)
        expect(res.data).toStrictEqual(account)
    })

    it("answers 401 without a session cookie", async () => {
        const res = await getMe({})

        expectApiError(res, 401, { code: "Unauthenticated" })
    })

    it("answers 401 to a session token the database does not hold", async () => {
        const res = await getMe({
            headers: { Cookie: `fomofobo.session_token=${crypto.randomUUID()}` },
        })

        expectApiError(res, 401, { code: "Unauthenticated" })
    })
})
