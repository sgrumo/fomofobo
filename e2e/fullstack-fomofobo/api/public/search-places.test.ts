import { expectApiError, expectStatus } from "e2e-kit/assertions"
import { describe, expect, it } from "vitest"

import { GEOCODING_FAILURE_TEXT } from "../../geocoding-mock-contract"
import { signInAs } from "../auth/utils"
import {
    buildWeeklyRecurrence,
    seedEvent,
    seedEventReferences,
} from "../backoffice-events/utils"
import { blockVenue, createVenue } from "../backoffice-venues/api"
import { buildVenueCreation, seedCinema } from "../backoffice-venues/utils"
import { searchPlaces } from "./api"
import { SATURDAY_NOON } from "./utils"

describe("GET /api/public/places", () => {
    it("answers the places of the provider and the events whose title matches", async () => {
        const { headers } = await signInAs("organizer")
        const { categoryId, venue, venueId } = await seedEventReferences()
        const event = await seedEvent(
            headers,
            { venueId, categoryId },
            { title: "Jazz al Chiostro" },
        )
        await seedEvent(headers, { venueId, categoryId }, { title: "Rock in Rocca" })
        const center = venue.coordinates

        const res = await searchPlaces({
            headers: {
                "x-test-now": SATURDAY_NOON,
                "x-forwarded-for": crypto.randomUUID(),
            },
            queryParams: { q: "jazz", lat: center.latitude, lng: center.longitude },
        })

        expectStatus(res, 200)
        const cacheCenter = {
            latitude: Math.round(center.latitude * 100) / 100,
            longitude: Math.round(center.longitude * 100) / 100,
        }
        expect(res.data).toStrictEqual({
            places: [
                { label: "jazz, Imola, Italy", coordinates: cacheCenter },
                {
                    label: "jazz, Bologna, Italy",
                    coordinates: { ...cacheCenter, latitude: cacheCenter.latitude + 0.1 },
                },
            ],
            events: [
                { eventId: event.id, date: "2026-10-24", title: "Jazz al Chiostro" },
            ],
            venues: [],
        })
    })

    it("suggests the venues of the area whose name matches with their kind, and no blocked one", async () => {
        const admin = await signInAs("admin")
        const { categoryId, venue } = await seedEventReferences()
        const [open, closed, cinema] = await Promise.all([
            createVenue({
                headers: admin.headers,
                body: {
                    ...buildVenueCreation(),
                    name: `Teatro Stignani ${crypto.randomUUID().slice(0, 8)}`,
                    coordinates: venue.coordinates,
                },
            }),
            createVenue({
                headers: admin.headers,
                body: {
                    ...buildVenueCreation(),
                    name: `Teatro Chiuso ${crypto.randomUUID().slice(0, 8)}`,
                    coordinates: venue.coordinates,
                },
            }),
            seedCinema(categoryId, {
                name: `Teatro Cinema ${crypto.randomUUID().slice(0, 8)}`,
                coordinates: venue.coordinates,
            }),
        ])
        expectStatus(open, 201)
        expectStatus(closed, 201)
        expectStatus(
            await blockVenue({
                headers: admin.headers,
                pathParams: { id: closed.data.id },
                body: { reason: "Closed for works" },
            }),
            200,
        )

        const res = await searchPlaces({
            headers: {
                "x-test-now": SATURDAY_NOON,
                "x-forwarded-for": crypto.randomUUID(),
            },
            queryParams: {
                q: "teatro",
                lat: venue.coordinates.latitude,
                lng: venue.coordinates.longitude,
            },
        })

        expectStatus(res, 200)
        expect(res.data.venues).toStrictEqual([
            {
                venueId: cinema.id,
                name: cinema.name,
                address: cinema.address,
                kind: "cinema",
            },
            {
                venueId: open.data.id,
                name: open.data.name,
                address: open.data.address,
                kind: "regular",
            },
        ])
    })

    it("suggests the next occurrence of a repeating event that has not ended", async () => {
        const { headers } = await signInAs("organizer")
        const { categoryId, venue, venueId } = await seedEventReferences()
        const weekly = await seedEvent(
            headers,
            { venueId, categoryId },
            {
                title: "Mercato del sabato",
                startsAt: "2026-10-17T08:00",
                endsAt: "2026-10-17T13:00",
                recurrence: buildWeeklyRecurrence("2026-11-28"),
            },
        )

        const res = await searchPlaces({
            // Saturday 2026-10-24 at 14:00 in Rome: the market of the day has ended
            headers: {
                "x-test-now": "2026-10-24T14:00:00+02:00",
                "x-forwarded-for": crypto.randomUUID(),
            },
            queryParams: {
                q: "mercato",
                lat: venue.coordinates.latitude,
                lng: venue.coordinates.longitude,
            },
        })

        expectStatus(res, 200)
        expect(res.data.events).toStrictEqual([
            { eventId: weekly.id, date: "2026-10-31", title: "Mercato del sabato" },
        ])
    })

    it("answers 503 when the provider fails", async () => {
        const res = await searchPlaces({
            headers: { "x-forwarded-for": crypto.randomUUID() },
            queryParams: { q: GEOCODING_FAILURE_TEXT, lat: 44.35, lng: 11.71 },
        })

        expectApiError(res, 503, { code: "GeocodingUnavailable" })
    })

    it("answers 429 past 30 calls a minute from one client", async () => {
        const client = { "x-forwarded-for": crypto.randomUUID() }
        for (const call of Array.from({ length: 30 }, (_, n) => n)) {
            expectStatus(
                await searchPlaces({
                    headers: client,
                    queryParams: { q: `imola ${String(call)}`, lat: 44.35, lng: 11.71 },
                }),
                200,
            )
        }

        const res = await searchPlaces({
            headers: client,
            queryParams: { q: "imola", lat: 44.35, lng: 11.71 },
        })

        expectApiError(res, 429, { code: "TooManyRequests" })
    })
})
