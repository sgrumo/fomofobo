import axios from "axios"
import { expectRawStatus } from "e2e-kit/assertions"
import { publishedAppUrl } from "e2e-kit/env"
import { describe, expect, it } from "vitest"

describe("GET /api/health", () => {
    it("answers 200 without a token", async () => {
        const res = await axios.get(`${publishedAppUrl()}/api/health`, {
            validateStatus: () => true,
        })

        expectRawStatus(res, 200)
        expect(res.data).toStrictEqual({ status: "ok" })
    })
})
