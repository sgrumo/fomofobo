import axios from "axios"
import { expectApiError, expectRawStatus } from "e2e-kit/assertions"
import { publishedAppUrl } from "e2e-kit/env"
import { describe, it } from "vitest"

import { buildAccountSeed, seedAccount, signIn, toCookieHeader } from "./utils"

const unexposedEndpoints = [
    "/api/auth/sign-up/email",
    "/api/auth/get-session",
    "/api/auth/sign-out",
    "/api/auth/change-password",
    "/api/auth/update-user",
    "/api/auth/admin/create-user",
    "/api/auth/admin/set-role",
    "/api/auth/admin/impersonate-user",
]

describe("auth library endpoints", () => {
    it("answer 404 to every endpoint but the sign-in", async () => {
        for (const path of unexposedEndpoints) {
            const res = await axios.post(
                `${publishedAppUrl()}${path}`,
                { email: "someone@fomofobo.local", password: crypto.randomUUID() },
                { validateStatus: () => true },
            )

            expectApiError(res, 404, { code: "RouteNotFound" })
        }
    })

    it("answer 404 to an Admin session too", async () => {
        const seed = buildAccountSeed("admin")
        await seedAccount(seed)
        const session = await signIn({ email: seed.email, password: seed.password })
        expectRawStatus(session, 200)
        const cookie = toCookieHeader(session.headers["set-cookie"])

        for (const path of unexposedEndpoints) {
            const res = await axios.post(
                `${publishedAppUrl()}${path}`,
                { email: "someone@fomofobo.local", password: crypto.randomUUID() },
                { headers: { Cookie: cookie }, validateStatus: () => true },
            )

            expectApiError(res, 404, { code: "RouteNotFound" })
        }
    })
})
