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
import { buildVenueCreation, seedCinema } from "../backoffice-venues/utils"
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
                lat: venue.coordinates.latitude,
                lng: venue.coordinates.longitude,
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
                },
            ],
            [{ categoryId, count: 1 }],
        ])
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
                lat: venue.coordinates.latitude,
                lng: venue.coordinates.longitude,
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
                lat: venue.coordinates.latitude,
                lng: venue.coordinates.longitude,
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
