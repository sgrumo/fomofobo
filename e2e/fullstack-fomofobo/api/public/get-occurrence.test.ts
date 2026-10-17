import { expectApiError, expectStatus } from "e2e-kit/assertions"
import { describe, expect, it } from "vitest"

import { signInAs } from "../auth/utils"
import { blockEvent, updateEvent } from "../backoffice-events/api"
import {
    buildEventUpsert,
    buildWeeklyRecurrence,
    seedEvent,
    seedEventReferences,
    uploadPhoto,
} from "../backoffice-events/utils"
import { getOccurrence } from "./api"

describe("GET /api/public/occurrences/{eventId}/{date}", () => {
    it("answers the occurrence with its venue address, photos and links", async () => {
        const { headers } = await signInAs("organizer")
        const { categoryId, venue, venueId } = await seedEventReferences()
        const event = await seedEvent(headers, { venueId, categoryId })

        const res = await getOccurrence({
            pathParams: { eventId: event.id, date: "2026-10-24" },
        })

        expectStatus(res, 200)
        expect(res.data).toStrictEqual({
            eventId: event.id,
            date: "2026-10-24",
            startsAt: "2026-10-24T19:00:00.000Z",
            endsAt: "2026-10-24T21:30:00.000Z",
            title: event.title,
            description: event.description,
            venue: {
                id: venue.id,
                name: venue.name,
                address: venue.address,
                coordinates: venue.coordinates,
            },
            categoryIds: [categoryId],
            primaryCategoryId: categoryId,
            coverPhotoUrl: event.photos[0]?.url,
            price: event.price,
            photos: event.photos,
            externalLinks: event.externalLinks,
        })
    })

    it("answers 404 for a date that the rule of a repeating event does not produce", async () => {
        const { headers } = await signInAs("organizer")
        const { categoryId, venueId } = await seedEventReferences()
        const event = await seedEvent(
            headers,
            { venueId, categoryId },
            { recurrence: buildWeeklyRecurrence("2026-11-28") },
        )

        const [saturday, sunday] = await Promise.all([
            getOccurrence({ pathParams: { eventId: event.id, date: "2026-10-31" } }),
            getOccurrence({ pathParams: { eventId: event.id, date: "2026-11-01" } }),
        ])

        expectStatus(saturday, 200)
        expectApiError(sunday, 404, { code: "OccurrenceNotFound" })
    })

    it("resolves the old link of a single event that moved to another date", async () => {
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
                    {
                        startsAt: "2026-11-07T21:00",
                        endsAt: "2026-11-07T23:30",
                    },
                ),
            }),
            200,
        )

        const res = await getOccurrence({
            pathParams: { eventId: event.id, date: "2026-10-24" },
        })

        expectStatus(res, 200)
        expect(res.data).toMatchObject({
            date: "2026-11-07",
            startsAt: "2026-11-07T20:00:00.000Z",
        })
    })

    it("answers 404 on the next request once an Admin blocks the event", async () => {
        const { headers } = await signInAs("organizer")
        const admin = await signInAs("admin")
        const { categoryId, venueId } = await seedEventReferences()
        const event = await seedEvent(headers, { venueId, categoryId })
        const ref = { eventId: event.id, date: "2026-10-24" }
        expectStatus(await getOccurrence({ pathParams: ref }), 200)
        expectStatus(
            await blockEvent({
                headers: admin.headers,
                pathParams: { id: event.id },
                body: { reason: "Spam" },
            }),
            200,
        )

        const res = await getOccurrence({ pathParams: ref })

        expectApiError(res, 404, { code: "OccurrenceNotFound" })
    })

    it("replaces the occurrences of a repeating event that its Organizer edits", async () => {
        const { headers } = await signInAs("organizer")
        const { categoryId, venueId } = await seedEventReferences()
        const event = await seedEvent(
            headers,
            { venueId, categoryId },
            { recurrence: buildWeeklyRecurrence("2026-11-28") },
        )
        const removed = { eventId: event.id, date: "2026-11-07" }
        expectStatus(await getOccurrence({ pathParams: removed }), 200)
        const photo = await uploadPhoto(headers)

        expectStatus(
            await updateEvent({
                headers,
                pathParams: { id: event.id },
                body: buildEventUpsert(
                    { venueId, categoryId, photoKeys: [photo.key] },
                    {
                        recurrence: {
                            ...buildWeeklyRecurrence("2026-11-28"),
                            removedDates: ["2026-11-07"],
                            addedDates: ["2026-11-11"],
                        },
                    },
                ),
            }),
            200,
        )

        const [gone, added] = await Promise.all([
            getOccurrence({ pathParams: removed }),
            getOccurrence({ pathParams: { eventId: event.id, date: "2026-11-11" } }),
        ])
        expectApiError(gone, 404, { code: "OccurrenceNotFound" })
        expectStatus(added, 200)
    })
})
