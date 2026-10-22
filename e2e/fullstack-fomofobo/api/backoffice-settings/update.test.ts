import { expectApiError, expectStatus } from "e2e-kit/assertions"
import { anyIsoDateTime } from "e2e-kit/matchers"
import { describe, expect, it } from "vitest"

import { signInAs } from "../auth/utils"
import { getSettings, updateSettings } from "./api"

describe("PUT /api/backoffice/settings", () => {
    it("saves the settings with the Admin who saved them", async () => {
        const { account, headers } = await signInAs("admin")
        const fields = { endedVisibleDays: 7, participantThreshold: 35 }

        const res = await updateSettings({ headers, body: fields })

        expectStatus(res, 200)
        expect(res.data).toStrictEqual({
            ...fields,
            updatedAt: anyIsoDateTime,
            updatedBy: { id: account.id, name: account.name },
        })
        const read = await getSettings({ headers })
        expectStatus(read, 200)
        expect(read.data).toStrictEqual(res.data)
    })

    it("replaces the settings an Admin saved before", async () => {
        const first = await signInAs("admin")
        const second = await signInAs("admin")
        expectStatus(
            await updateSettings({
                headers: first.headers,
                body: { endedVisibleDays: 10, participantThreshold: 50 },
            }),
            200,
        )

        const res = await updateSettings({
            headers: second.headers,
            body: { endedVisibleDays: 0, participantThreshold: 1 },
        })

        expectStatus(res, 200)
        const read = await getSettings({ headers: first.headers })
        expectStatus(read, 200)
        expect(read.data).toMatchObject({
            endedVisibleDays: 0,
            participantThreshold: 1,
            updatedBy: { id: second.account.id },
        })
    })

    it("answers 401 without a session cookie", async () => {
        const res = await updateSettings({
            body: { endedVisibleDays: 3, participantThreshold: 20 },
        })

        expectApiError(res, 401, { code: "Unauthenticated" })
    })

    it("answers 403 to an Organizer", async () => {
        const { headers } = await signInAs("organizer")

        const res = await updateSettings({
            headers,
            body: { endedVisibleDays: 3, participantThreshold: 20 },
        })

        expectApiError(res, 403, { code: "ForbiddenAction" })
    })
})
