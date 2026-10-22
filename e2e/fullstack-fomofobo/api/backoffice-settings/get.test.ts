import { expectApiError, expectStatus } from "e2e-kit/assertions"
import { describe, expect, it } from "vitest"

import { signInAs } from "../auth/utils"
import { getSettings } from "./api"

describe("GET /api/backoffice/settings", () => {
    it("answers the defaults while no Admin saved the settings", async () => {
        const { headers } = await signInAs("admin")

        const res = await getSettings({ headers })

        expectStatus(res, 200)
        expect(res.data).toStrictEqual({
            endedVisibleDays: 3,
            participantThreshold: 20,
            updatedAt: null,
            updatedBy: null,
        })
    })

    it("answers 401 without a session cookie", async () => {
        const res = await getSettings({})

        expectApiError(res, 401, { code: "Unauthenticated" })
    })

    it("answers 403 to an Organizer", async () => {
        const { headers } = await signInAs("organizer")

        const res = await getSettings({ headers })

        expectApiError(res, 403, { code: "ForbiddenAction" })
    })
})
