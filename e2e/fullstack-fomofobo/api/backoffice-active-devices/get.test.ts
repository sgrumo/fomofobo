import { expectApiError, expectStatus } from "e2e-kit/assertions"
import { describe, expect, it } from "vitest"

import { signInAs } from "../auth/utils"
import { getActiveDevices } from "./api"

describe("GET /api/backoffice/active-devices", () => {
    it("answers empty counts before any check-in", async () => {
        const { headers } = await signInAs("admin")

        const res = await getActiveDevices({ headers })

        expectStatus(res, 200)
        expect(res.data).toStrictEqual({
            today: [],
            last7Days: [],
            last30Days: [],
            daily: [],
        })
    })

    it("answers 401 without a session cookie", async () => {
        const res = await getActiveDevices({})

        expectApiError(res, 401, { code: "Unauthenticated" })
    })

    it("answers 403 to an Organizer", async () => {
        const { headers } = await signInAs("organizer")

        const res = await getActiveDevices({ headers })

        expectApiError(res, 403, { code: "ForbiddenAction" })
    })
})
