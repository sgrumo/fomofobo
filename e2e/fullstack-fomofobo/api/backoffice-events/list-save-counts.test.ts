import { expectApiError, expectStatus } from "e2e-kit/assertions"
import { describe, expect, it } from "vitest"

import { signInAs } from "../auth/utils"
import { saveOccurrence } from "../public/api"
import { SATURDAY_NOON } from "../public/utils"
import { listEventSaveCounts } from "./api"
import { buildWeeklyRecurrence, seedEvent, seedEventReferences } from "./utils"

describe("GET /api/backoffice/events/{id}/saves", () => {
    it("lists every occurrence not ended with its saves, under the threshold too", async () => {
        const organizer = await signInAs("organizer")
        const admin = await signInAs("admin")
        const { categoryId, venueId } = await seedEventReferences()
        const event = await seedEvent(
            organizer.headers,
            { venueId, categoryId },
            {
                startsAt: "2026-10-17T21:00",
                endsAt: "2026-10-17T23:30",
                recurrence: buildWeeklyRecurrence("2026-10-31"),
            },
        )
        const client = {
            "x-test-now": SATURDAY_NOON,
            "x-forwarded-for": crypto.randomUUID(),
        }
        for (const [date, deviceId] of [
            ["2026-10-24", crypto.randomUUID()],
            ["2026-10-24", crypto.randomUUID()],
            ["2026-10-31", crypto.randomUUID()],
        ] as const) {
            expectStatus(
                await saveOccurrence({
                    headers: client,
                    pathParams: { eventId: event.id, date },
                    body: { deviceId },
                }),
                204,
            )
        }

        const [own, asAdmin] = await Promise.all([
            listEventSaveCounts({
                headers: { ...organizer.headers, "x-test-now": SATURDAY_NOON },
                pathParams: { id: event.id },
            }),
            listEventSaveCounts({
                headers: { ...admin.headers, "x-test-now": SATURDAY_NOON },
                pathParams: { id: event.id },
            }),
        ])

        expectStatus(own, 200)
        expectStatus(asAdmin, 200)
        expect(own.data).toStrictEqual([
            { date: "2026-10-24", startsAt: "2026-10-24T19:00:00.000Z", count: 2 },
            { date: "2026-10-31", startsAt: "2026-10-31T20:00:00.000Z", count: 1 },
        ])
        expect(asAdmin.data).toStrictEqual(own.data)
    })

    it("answers 404 to an Organizer that does not own the event", async () => {
        const owner = await signInAs("organizer")
        const other = await signInAs("organizer")
        const { categoryId, venueId } = await seedEventReferences()
        const event = await seedEvent(owner.headers, { venueId, categoryId })

        const res = await listEventSaveCounts({
            headers: other.headers,
            pathParams: { id: event.id },
        })

        expectApiError(res, 404, { code: "EventNotFound" })
    })
})
