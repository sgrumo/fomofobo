import { expectApiError, expectStatus } from "e2e-kit/assertions"
import { describe, expect, it } from "vitest"

import { signInAs } from "../auth/utils"
import { createCategory } from "../backoffice-categories/api"
import { buildCategoryCreation } from "../backoffice-categories/utils"
import { blockEvent, deleteEvent } from "../backoffice-events/api"
import {
    buildFreePriceScheme,
    seedEvent,
    seedEventReferences,
} from "../backoffice-events/utils"
import { blockOrganizer } from "../backoffice-organizers/api"
import { updateSettings } from "../backoffice-settings/api"
import { blockVenue, createVenue } from "../backoffice-venues/api"
import {
    buildVenueCreation,
    seedCinema,
    seedPermanentVenue,
} from "../backoffice-venues/utils"
import { searchOccurrences } from "./api"
import { boxAround, SATURDAY_NOON } from "./utils"

describe("GET /api/public/occurrences", () => {
    it("answers the occurrences of venues inside the box, without a session", async () => {
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
                ...boxAround(venue.coordinates),
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
                        isBlocked: false,
                    },
                    categoryIds: [categoryId],
                    primaryCategoryId: categoryId,
                    coverPhotoUrl: saturday.photos[0]?.url,
                    priceScheme: saturday.priceScheme,
                    interestedCount: null,
                },
                expect.objectContaining({
                    eventId: sunday.id,
                    date: "2026-10-25",
                    startsAt: "2026-10-25T20:00:00.000Z",
                }),
            ],
            permanentVenues: [],
            categoryCounts: [{ categoryId, count: 2 }],
            truncated: false,
        })
    })

    it("answers the occurrences of a box that spans two cities", async () => {
        const { headers } = await signInAs("organizer")
        const admin = await signInAs("admin")
        const { categoryId, venueId } = await seedEventReferences()
        const far = await createVenue({
            headers: admin.headers,
            body: {
                ...buildVenueCreation(),
                coordinates: { latitude: 44.4938, longitude: 11.3426 },
            },
        })
        expectStatus(far, 201)
        const near = await seedEvent(headers, { venueId, categoryId })
        const farEvent = await seedEvent(headers, { venueId: far.data.id, categoryId })

        const res = await searchOccurrences({
            headers: { "x-test-now": SATURDAY_NOON },
            queryParams: { west: 11.3, south: 44.3, east: 11.75, north: 44.55 },
        })

        expectStatus(res, 200)
        expect(
            res.data.occurrences.map(occurrence => occurrence.eventId).toSorted(),
        ).toStrictEqual([near.id, farEvent.id].toSorted())
    })

    it("answers the permanent venues of the area under any date filter, and counts them", async () => {
        const { headers } = await signInAs("organizer")
        const admin = await signInAs("admin")
        const { categoryId, venue, venueId } = await seedEventReferences()
        const [near, , blocked] = await Promise.all([
            seedCinema(categoryId, { coordinates: venue.coordinates }),
            seedCinema(categoryId, {
                coordinates: { latitude: 44.4938, longitude: 11.3426 },
            }),
            seedCinema(categoryId, { coordinates: venue.coordinates }),
        ])
        expectStatus(
            await blockVenue({
                headers: admin.headers,
                pathParams: { id: blocked.id },
                body: { reason: "Closed for works" },
            }),
            200,
        )
        await seedEvent(headers, { venueId, categoryId })

        const res = await searchOccurrences({
            headers: { "x-test-now": SATURDAY_NOON },
            queryParams: {
                ...boxAround(venue.coordinates),
                date: "tomorrow",
            },
        })

        expectStatus(res, 200)
        expect([
            res.data.occurrences,
            res.data.permanentVenues,
            res.data.categoryCounts,
        ]).toStrictEqual([
            [],
            [
                {
                    id: near.id,
                    name: near.name,
                    address: near.address,
                    coordinates: near.coordinates,
                    coverPhotoUrl: null,
                    kind: "cinema",
                    programmeUrl: near.programmeUrl,
                    categoryId,
                    closingDays: near.closingDays,
                },
            ],
            [{ categoryId, count: 1 }],
        ])
    })

    it("answers a theatre while it holds an event that has not ended, under any date filter, and a cinema with no event", async () => {
        const { headers } = await signInAs("organizer")
        const { categoryId, venue } = await seedEventReferences()
        const coordinates = venue.coordinates
        const [running, ended, , cinema] = await Promise.all([
            seedPermanentVenue(categoryId, "theatre", { coordinates }),
            seedPermanentVenue(categoryId, "theatre", { coordinates }),
            seedPermanentVenue(categoryId, "theatre", { coordinates }),
            seedCinema(categoryId, { coordinates }),
        ])
        await seedEvent(headers, { venueId: running.id, categoryId })
        await seedEvent(
            headers,
            { venueId: ended.id, categoryId },
            { startsAt: "2026-10-24T08:00", endsAt: "2026-10-24T09:00" },
        )

        const res = await searchOccurrences({
            headers: { "x-test-now": SATURDAY_NOON },
            queryParams: {
                ...boxAround(coordinates),
                date: "tomorrow",
            },
        })

        expectStatus(res, 200)
        expect(
            new Set(res.data.permanentVenues.map(permanent => permanent.id)),
        ).toStrictEqual(new Set([running.id, cinema.id]))
        expect(res.data.categoryCounts).toStrictEqual([{ categoryId, count: 2 }])
    })

    it("keeps the free events alone under the free filter, and counts them", async () => {
        const { headers } = await signInAs("organizer")
        const { categoryId, venue, venueId } = await seedEventReferences()
        await seedCinema(categoryId, { coordinates: venue.coordinates })
        const free = await seedEvent(
            headers,
            { venueId, categoryId },
            { priceScheme: buildFreePriceScheme() },
        )
        await seedEvent(headers, { venueId, categoryId })

        const res = await searchOccurrences({
            headers: { "x-test-now": SATURDAY_NOON },
            queryParams: {
                ...boxAround(venue.coordinates),
                free: "true",
            },
        })

        expectStatus(res, 200)
        expect([
            res.data.occurrences.map(occurrence => occurrence.eventId),
            res.data.permanentVenues,
            res.data.categoryCounts,
        ]).toStrictEqual([[free.id], [], [{ categoryId, count: 1 }]])
    })

    it("filters the permanent venues by name and by category, and counts them under the other filters", async () => {
        const admin = await signInAs("admin")
        const { categoryId: cinema, venue } = await seedEventReferences()
        const art = await createCategory({
            headers: admin.headers,
            body: buildCategoryCreation(),
        })
        expectStatus(art, 201)
        const [astra] = await Promise.all([
            seedCinema(cinema, {
                name: `Cinema Astra ${crypto.randomUUID().slice(0, 8)}`,
                coordinates: venue.coordinates,
            }),
            seedCinema(art.data.id, {
                name: `Astra Arte ${crypto.randomUUID().slice(0, 8)}`,
                coordinates: venue.coordinates,
            }),
            seedCinema(cinema, {
                name: `Cinema Modernissimo ${crypto.randomUUID().slice(0, 8)}`,
                coordinates: venue.coordinates,
            }),
        ])

        const res = await searchOccurrences({
            headers: { "x-test-now": SATURDAY_NOON },
            queryParams: {
                ...boxAround(venue.coordinates),
                q: "astra",
                categoryIds: [cinema],
            },
        })

        expectStatus(res, 200)
        expect(res.data.permanentVenues.map(permanent => permanent.id)).toStrictEqual([
            astra.id,
        ])
        expect(
            res.data.categoryCounts.toSorted((a, b) =>
                a.categoryId.localeCompare(b.categoryId),
            ),
        ).toStrictEqual(
            [
                { categoryId: cinema, count: 1 },
                { categoryId: art.data.id, count: 1 },
            ].toSorted((a, b) => a.categoryId.localeCompare(b.categoryId)),
        )
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
                ...boxAround(venue.coordinates),
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
                ...boxAround(venue.coordinates),
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
                ...boxAround(venue.coordinates),
                date: "tomorrow",
            },
        })

        expectStatus(res, 200)
        expect(res.data.occurrences.map(occurrence => occurrence.eventId)).toStrictEqual([
            late.id,
        ])
    })

    it("counts an occurrence that starts in the two hours after midnight for the day before, and for its own day", async () => {
        const { headers } = await signInAs("organizer")
        const { categoryId, venue, venueId } = await seedEventReferences()
        const [party, late] = await Promise.all([
            seedEvent(
                headers,
                { venueId, categoryId },
                { startsAt: "2026-10-31T01:30", endsAt: "2026-10-31T05:00" },
            ),
            seedEvent(
                headers,
                { venueId, categoryId },
                { startsAt: "2026-10-31T02:00", endsAt: "2026-10-31T05:00" },
            ),
        ])

        const friday = await searchOccurrences({
            headers: { "x-test-now": SATURDAY_NOON },
            queryParams: {
                ...boxAround(venue.coordinates),
                date: "range",
                from: "2026-10-30",
                to: "2026-10-30",
            },
        })
        const saturday = await searchOccurrences({
            headers: { "x-test-now": SATURDAY_NOON },
            queryParams: {
                ...boxAround(venue.coordinates),
                date: "range",
                from: "2026-10-31",
                to: "2026-10-31",
            },
        })

        expectStatus(friday, 200)
        expectStatus(saturday, 200)
        expect(
            friday.data.occurrences.map(occurrence => occurrence.eventId),
        ).toStrictEqual([party.id])
        expect(
            new Set(saturday.data.occurrences.map(occurrence => occurrence.eventId)),
        ).toStrictEqual(new Set([party.id, late.id]))
    })

    it("keeps the occurrences that run in a chosen day part, the evening to 06:00 of the next day, and counts them", async () => {
        const { headers } = await signInAs("organizer")
        const { categoryId, venue, venueId } = await seedEventReferences()
        const [morning, afternoon, night] = await Promise.all([
            seedEvent(
                headers,
                { venueId, categoryId },
                { startsAt: "2026-10-25T09:00", endsAt: "2026-10-25T11:00" },
            ),
            seedEvent(
                headers,
                { venueId, categoryId },
                { startsAt: "2026-10-25T15:00", endsAt: "2026-10-25T17:00" },
            ),
            seedEvent(
                headers,
                { venueId, categoryId },
                { startsAt: "2026-10-26T03:00", endsAt: "2026-10-26T05:00" },
            ),
            seedEvent(
                headers,
                { venueId, categoryId },
                { startsAt: "2026-10-25T04:00", endsAt: "2026-10-25T05:30" },
            ),
        ])

        const evening = await searchOccurrences({
            headers: { "x-test-now": SATURDAY_NOON },
            queryParams: {
                ...boxAround(venue.coordinates),
                date: "tomorrow",
                dayParts: ["evening"],
            },
        })
        const daytime = await searchOccurrences({
            headers: { "x-test-now": SATURDAY_NOON },
            queryParams: {
                ...boxAround(venue.coordinates),
                date: "tomorrow",
                dayParts: ["morning", "afternoon"],
            },
        })

        expectStatus(evening, 200)
        expectStatus(daytime, 200)
        expect([
            evening.data.occurrences.map(occurrence => occurrence.eventId),
            evening.data.categoryCounts,
        ]).toStrictEqual([[night.id], [{ categoryId, count: 1 }]])
        expect([
            daytime.data.occurrences.map(occurrence => occurrence.eventId),
            daytime.data.categoryCounts,
        ]).toStrictEqual([[morning.id, afternoon.id], [{ categoryId, count: 2 }]])
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
                ...boxAround(venue.coordinates),
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
                ...boxAround(venue.coordinates),
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
                ...boxAround({ latitude: 44.35, longitude: 11.71 }),
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
                ...boxAround(venue.coordinates),
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
