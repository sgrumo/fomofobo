import { expectApiError } from "e2e-kit/assertions"
import { describe, it } from "vitest"

import { getMe } from "./api"

describe("GET /api/backoffice/me", () => {
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
