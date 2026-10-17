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
import { lookupOccurrences } from "./api"

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
            queryParams: { ref: [`${event.id}:2026-10-24`] },
        })

        expectStatus(res, 200)
        expect(
            res.data.map(occurrence => [occurrence.eventId, occurrence.date]),
        ).toStrictEqual([[event.id, "2026-11-07"]])
    })
})
