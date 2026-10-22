import { expectStatus } from "e2e-kit/assertions"
import { describe, expect, it } from "vitest"

import { signInAs } from "../auth/utils"
import { blockEvent, deleteEvent, updateEvent } from "../backoffice-events/api"
import {
    buildEventUpsert,
    buildWeeklyRecurrence,
    seedEvent,
    seedEventReferences,
    uploadPhoto,
} from "../backoffice-events/utils"
import { updateSettings } from "../backoffice-settings/api"
import { lookupOccurrences } from "./api"
import { SATURDAY_NOON } from "./utils"

describe("GET /api/public/occurrences/lookup", () => {
    it("answers the visible occurrences in ref order and drops the others", async () => {
        const { headers } = await signInAs("organizer")
        const admin = await signInAs("admin")
        const { categoryId, venueId } = await seedEventReferences()
        const weekly = await seedEvent(
            headers,
            { venueId, categoryId },
            { recurrence: buildWeeklyRecurrence("2026-11-28") },
        )
        const single = await seedEvent(headers, { venueId, categoryId })
        const blocked = await seedEvent(headers, { venueId, categoryId })
        const deleted = await seedEvent(headers, { venueId, categoryId })
        expectStatus(
            await blockEvent({
                headers: admin.headers,
                pathParams: { id: blocked.id },
                body: { reason: "Spam" },
            }),
            200,
        )
        expectStatus(await deleteEvent({ headers, pathParams: { id: deleted.id } }), 204)

        const res = await lookupOccurrences({
            headers: { "x-test-now": SATURDAY_NOON },
            queryParams: {
                ref: [
                    `${single.id}:2026-10-24`,
                    `${blocked.id}:2026-10-24`,
                    `${weekly.id}:2026-11-07`,
                    `${deleted.id}:2026-10-24`,
                    `${weekly.id}:2026-11-08`,
                    `${crypto.randomUUID()}:2026-10-24`,
                ],
            },
        })

        expectStatus(res, 200)
        expect(
            res.data.map(occurrence => [occurrence.eventId, occurrence.date]),
        ).toStrictEqual([
            [single.id, "2026-10-24"],
            [weekly.id, "2026-11-07"],
        ])
    })

    it("drops a ref once its occurrence ended three days ago", async () => {
        const { headers } = await signInAs("organizer")
        const { categoryId, venueId } = await seedEventReferences()
        const event = await seedEvent(headers, { venueId, categoryId })
        const queryParams = { ref: [`${event.id}:2026-10-24`] }

        const [lastMinute, expired] = await Promise.all([
            lookupOccurrences({
                headers: { "x-test-now": "2026-10-27T21:29:00.000Z" },
                queryParams,
            }),
            lookupOccurrences({
                headers: { "x-test-now": "2026-10-27T21:30:00.000Z" },
                queryParams,
            }),
        ])

        expectStatus(lastMinute, 200)
        expectStatus(expired, 200)
        expect(lastMinute.data.map(occurrence => occurrence.eventId)).toStrictEqual([
            event.id,
        ])
        expect(expired.data).toStrictEqual([])
    })

    it("drops a ref at its end when an Admin saved zero retention days", async () => {
        const { headers } = await signInAs("organizer")
        const admin = await signInAs("admin")
        const { categoryId, venueId } = await seedEventReferences()
        const event = await seedEvent(headers, { venueId, categoryId })
        const queryParams = { ref: [`${event.id}:2026-10-24`] }
        expectStatus(
            await updateSettings({
                headers: admin.headers,
                body: { endedVisibleDays: 0, participantThreshold: 20 },
            }),
            200,
        )

        const [running, ended] = await Promise.all([
            lookupOccurrences({
                headers: { "x-test-now": "2026-10-24T21:29:00.000Z" },
                queryParams,
            }),
            lookupOccurrences({
                headers: { "x-test-now": "2026-10-24T21:30:00.000Z" },
                queryParams,
            }),
        ])

        expectStatus(running, 200)
        expectStatus(ended, 200)
        expect(running.data.map(occurrence => occurrence.eventId)).toStrictEqual([
            event.id,
        ])
        expect(ended.data).toStrictEqual([])
    })

    it("resolves the saved ref of a single event that moved to another date", async () => {
        const { headers } = await signInAs("organizer")
        const { categoryId, venueId } = await seedEventReferences()
        const event = await seedEvent(headers, { venueId, categoryId })
        const photo = await uploadPhoto(headers)
        expectStatus(
            await updateEvent({
                headers,
                pathParams: { id: event.id },
                body: buildEventUpsert(
                    { venueId, categoryId, photoKeys: [photo.key] },
                    { startsAt: "2026-11-07T21:00", endsAt: "2026-11-07T23:30" },
                ),
            }),
            200,
        )

        const res = await lookupOccurrences({
            headers: { "x-test-now": SATURDAY_NOON },
            queryParams: { ref: [`${event.id}:2026-10-24`] },
        })

        expectStatus(res, 200)
        expect(
            res.data.map(occurrence => [occurrence.eventId, occurrence.date]),
        ).toStrictEqual([[event.id, "2026-11-07"]])
    })
})
