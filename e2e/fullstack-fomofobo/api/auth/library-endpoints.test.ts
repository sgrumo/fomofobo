import axios from "axios"
import { expectApiError } from "e2e-kit/assertions"
import { publishedAppUrl } from "e2e-kit/env"
import { describe, it } from "vitest"

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
})
