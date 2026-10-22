import { expectApiError, expectStatus } from "e2e-kit/assertions"
import { describe, expect, it } from "vitest"

import { signInAs } from "../auth/utils"
import { seedEvent, seedEventReferences } from "../backoffice-events/utils"
import { updateSettings } from "../backoffice-settings/api"
import { getOccurrence, saveOccurrence, unsaveOccurrence } from "./api"
import { SATURDAY_NOON } from "./utils"

describe("DELETE /api/public/saves/{eventId}/{date}", () => {
    it("removes the save of the device from the count", async () => {
        const { headers } = await signInAs("organizer")
        const admin = await signInAs("admin")
        const { categoryId, venueId } = await seedEventReferences()
        const event = await seedEvent(headers, { venueId, categoryId })
        expectStatus(
            await updateSettings({
                headers: admin.headers,
                body: { endedVisibleDays: 3, participantThreshold: 1 },
            }),
            200,
        )
        const client = {
            "x-test-now": SATURDAY_NOON,
            "x-forwarded-for": crypto.randomUUID(),
        }
        const pathParams = { eventId: event.id, date: "2026-10-24" }
        const body = { deviceId: crypto.randomUUID() }
        expectStatus(await saveOccurrence({ headers: client, pathParams, body }), 204)
        const saved = await getOccurrence({ headers: client, pathParams })
        expectStatus(saved, 200)

        const res = await unsaveOccurrence({ headers: client, pathParams, body })

        expectStatus(res, 204)
        const unsaved = await getOccurrence({ headers: client, pathParams })
        expectStatus(unsaved, 200)
        expect([saved.data.interestedCount, unsaved.data.interestedCount]).toStrictEqual([
            1,
            null,
        ])
    })

    it("answers 204 for a save the device never made", async () => {
        const res = await unsaveOccurrence({
            headers: { "x-forwarded-for": crypto.randomUUID() },
            pathParams: { eventId: crypto.randomUUID(), date: "2026-10-24" },
            body: { deviceId: crypto.randomUUID() },
        })

        expectStatus(res, 204)
    })

    it("answers 429 past 60 save calls of one client in ten minutes", async () => {
        const client = { "x-forwarded-for": crypto.randomUUID() }
        const pathParams = { eventId: crypto.randomUUID(), date: "2026-10-24" }
        const body = { deviceId: crypto.randomUUID() }
        // One call at a time: the window counts the calls in the order they land
        await Array.from({ length: 60 }).reduce<Promise<void>>(async previous => {
            await previous
            expectStatus(
                await unsaveOccurrence({ headers: client, pathParams, body }),
                204,
            )
        }, Promise.resolve())

        const res = await unsaveOccurrence({ headers: client, pathParams, body })

        expectApiError(res, 429, { code: "TooManyRequests" })
    })
})
