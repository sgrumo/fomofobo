import { expectApiError, expectStatus } from "e2e-kit/assertions"
import { describe, expect, it } from "vitest"

import { signInAs } from "../auth/utils"
import { createCategory } from "../backoffice-categories/api"
import { buildCategoryCreation } from "../backoffice-categories/utils"
import { blockEvent, deleteEvent } from "../backoffice-events/api"
import { seedEvent, seedEventReferences } from "../backoffice-events/utils"
import { blockOrganizer } from "../backoffice-organizers/api"
import { updateSettings } from "../backoffice-settings/api"
import { createVenue } from "../backoffice-venues/api"
import { buildVenueCreation } from "../backoffice-venues/utils"
import { searchOccurrences } from "./api"
import { SATURDAY_NOON } from "./utils"

describe("GET /api/public/occurrences", () => {
    it("answers the occurrences of venues inside the radius, without a session", async () => {
        const { headers } = await signInAs("organizer")
        const admin = await signInAs("admin")
        const { categoryId, venue, venueId } = await seedEventReferences()
        const far = await createVenue({
            headers: admin.headers,
            body: {
                ...buildVenueCreation(),
                coordinates: { latitude: 44.4938, longitude: 11.3426 },
            },
        })
        expectStatus(far, 201)
        const saturday = await seedEvent(headers, { venueId, categoryId })
        const sunday = await seedEvent(
            headers,
            { venueId, categoryId },
            { startsAt: "2026-10-25T21:00", endsAt: "2026-10-25T23:30" },
        )
        await seedEvent(headers, { venueId: far.data.id, categoryId })

        const res = await searchOccurrences({
            headers: { "x-test-now": SATURDAY_NOON },
            queryParams: {
                lat: venue.coordinates.latitude,
                lng: venue.coordinates.longitude,
            },
        })

        expectStatus(res, 200)
        expect(res.data).toStrictEqual({
            window: { from: "2026-10-23T22:00:00.000Z", to: "2026-10-30T23:00:00.000Z" },
            occurrences: [
                {
                    eventId: saturday.id,
                    date: "2026-10-24",
                    startsAt: "2026-10-24T19:00:00.000Z",
                    endsAt: "2026-10-24T21:30:00.000Z",
                    title: saturday.title,
                    description: saturday.description,
                    venue: {
                        id: venue.id,
                        name: venue.name,
                        coordinates: venue.coordinates,
                    },
                    categoryIds: [categoryId],
                    primaryCategoryId: categoryId,
                    coverPhotoUrl: saturday.photos[0]?.url,
                    price: saturday.price,
                },
                expect.objectContaining({
                    eventId: sunday.id,
                    date: "2026-10-25",
                    startsAt: "2026-10-25T20:00:00.000Z",
                }),
            ],
            categoryCounts: [{ categoryId, count: 2 }],
            truncated: false,
        })
    })

    it("hides a blocked event, a deleted event and the events of a blocked organizer", async () => {
        const admin = await signInAs("admin")
        const kept = await signInAs("organizer")
        const blockedOrganizer = await signInAs("organizer")
        const { categoryId, venue, venueId } = await seedEventReferences()
        const visible = await seedEvent(kept.headers, { venueId, categoryId })
        const blocked = await seedEvent(kept.headers, { venueId, categoryId })
        const deleted = await seedEvent(kept.headers, { venueId, categoryId })
        await seedEvent(blockedOrganizer.headers, { venueId, categoryId })
        expectStatus(
            await blockEvent({
                headers: admin.headers,
                pathParams: { id: blocked.id },
                body: { reason: "Spam" },
            }),
            200,
        )
        expectStatus(
            await deleteEvent({ headers: kept.headers, pathParams: { id: deleted.id } }),
            204,
        )
        expectStatus(
            await blockOrganizer({
                headers: admin.headers,
                pathParams: { id: blockedOrganizer.account.id },
            }),
            200,
        )

        const res = await searchOccurrences({
            headers: { "x-test-now": SATURDAY_NOON },
            queryParams: {
                lat: venue.coordinates.latitude,
                lng: venue.coordinates.longitude,
            },
        })

        expectStatus(res, 200)
        expect(res.data.occurrences.map(occurrence => occurrence.eventId)).toStrictEqual([
            visible.id,
        ])
        expect(res.data.categoryCounts).toStrictEqual([{ categoryId, count: 1 }])
    })

    it("counts each category under the other filters, not under the category filter", async () => {
        const { headers } = await signInAs("organizer")
        const admin = await signInAs("admin")
        const { categoryId: music, venue, venueId } = await seedEventReferences()
        const art = await createCategory({
            headers: admin.headers,
            body: buildCategoryCreation(),
        })
        expectStatus(art, 201)
        const jazz = await seedEvent(
            headers,
            { venueId, categoryId: music },
            { title: "Jazz night" },
        )
        await seedEvent(
            headers,
            { venueId, categoryId: art.data.id },
            { title: "Jazz in mostra" },
        )
        await seedEvent(headers, { venueId, categoryId: music }, { title: "Rock night" })

        const res = await searchOccurrences({
            headers: { "x-test-now": SATURDAY_NOON },
            queryParams: {
                lat: venue.coordinates.latitude,
                lng: venue.coordinates.longitude,
                q: "jazz",
                categoryIds: [music],
            },
        })

        expectStatus(res, 200)
        expect(res.data.occurrences.map(occurrence => occurrence.eventId)).toStrictEqual([
            jazz.id,
        ])
        expect(
            res.data.categoryCounts.toSorted((a, b) =>
                a.categoryId.localeCompare(b.categoryId),
            ),
        ).toStrictEqual(
            [
                { categoryId: music, count: 1 },
                { categoryId: art.data.id, count: 1 },
            ].toSorted((a, b) => a.categoryId.localeCompare(b.categoryId)),
        )
    })

    it("matches an occurrence that runs past midnight on the day it ends", async () => {
        const { headers } = await signInAs("organizer")
        const { categoryId, venue, venueId } = await seedEventReferences()
        const late = await seedEvent(
            headers,
            { venueId, categoryId },
            { startsAt: "2026-10-24T21:00", endsAt: "2026-10-25T00:30" },
        )

        const res = await searchOccurrences({
            headers: { "x-test-now": SATURDAY_NOON },
            queryParams: {
                lat: venue.coordinates.latitude,
                lng: venue.coordinates.longitude,
                date: "tomorrow",
            },
        })

        expectStatus(res, 200)
        expect(res.data.occurrences.map(occurrence => occurrence.eventId)).toStrictEqual([
            late.id,
        ])
    })

    it("hides an occurrence ended today once an Admin saved zero retention days", async () => {
        const { headers } = await signInAs("organizer")
        const admin = await signInAs("admin")
        const { categoryId, venue, venueId } = await seedEventReferences()
        const morning = await seedEvent(
            headers,
            { venueId, categoryId },
            { startsAt: "2026-10-24T08:00", endsAt: "2026-10-24T09:00" },
        )
        const before = await searchOccurrences({
            headers: { "x-test-now": SATURDAY_NOON },
            queryParams: {
                lat: venue.coordinates.latitude,
                lng: venue.coordinates.longitude,
                date: "today",
            },
        })
        expectStatus(before, 200)
        expect(
            before.data.occurrences.map(occurrence => occurrence.eventId),
        ).toStrictEqual([morning.id])
        expectStatus(
            await updateSettings({
                headers: admin.headers,
                body: { endedVisibleDays: 0, participantThreshold: 20 },
            }),
            200,
        )

        const after = await searchOccurrences({
            headers: { "x-test-now": SATURDAY_NOON },
            queryParams: {
                lat: venue.coordinates.latitude,
                lng: venue.coordinates.longitude,
                date: "today",
            },
        })

        expectStatus(after, 200)
        expect(after.data.occurrences).toStrictEqual([])
    })

    it("answers 400 to a range that starts before today", async () => {
        const res = await searchOccurrences({
            headers: { "x-test-now": SATURDAY_NOON },
            queryParams: {
                lat: 44.35,
                lng: 11.71,
                date: "range",
                from: "2026-10-23",
                to: "2026-10-25",
            },
        })

        expectApiError(res, 400, { code: "PastDateRange" })
    })

    it("cuts past the cap, keeps the live occurrence first, and says so", async () => {
        const { headers } = await signInAs("organizer")
        const { categoryId, venue, venueId } = await seedEventReferences()
        const live = await seedEvent(
            headers,
            { venueId, categoryId },
            { startsAt: "2026-10-24T11:00", endsAt: "2026-10-24T13:00" },
        )
        // 20 batches of 25 parallel writes: the database file takes one writer at a time
        for (const batch of Array.from({ length: 20 }, (_, n) => n)) {
            await Promise.all(
                Array.from(
                    { length: 25 },
                    async () =>
                        await seedEvent(
                            headers,
                            { venueId, categoryId },
                            { title: `Upcoming ${String(batch)}` },
                        ),
                ),
            )
        }

        const res = await searchOccurrences({
            headers: { "x-test-now": SATURDAY_NOON },
            queryParams: {
                lat: venue.coordinates.latitude,
                lng: venue.coordinates.longitude,
            },
        })

        expectStatus(res, 200)
        expect([
            res.data.occurrences.length,
            res.data.occurrences[0]?.eventId,
            res.data.truncated,
        ]).toStrictEqual([500, live.id, true])
    })
})
