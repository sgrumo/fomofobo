import { expectApiError, expectStatus } from "e2e-kit/assertions"
import { describe, expect, it } from "vitest"

import { signInAs } from "../auth/utils"
import { blockEvent } from "../backoffice-events/api"
import {
    buildWeeklyRecurrence,
    seedEvent,
    seedEventReferences,
} from "../backoffice-events/utils"
import { blockVenue, setVenueKind } from "../backoffice-venues/api"
import { buildCinemaKind } from "../backoffice-venues/utils"
import { getPublicVenue } from "./api"
import { SATURDAY_NOON } from "./utils"

describe("GET /api/public/venues/{venueId}", () => {
    it("answers the profile with the upcoming events, live first", async () => {
        const { headers } = await signInAs("organizer")
        const { categoryId, venue, venueId } = await seedEventReferences()
        const tonight = await seedEvent(headers, { venueId, categoryId })
        const live = await seedEvent(
            headers,
            { venueId, categoryId },
            { startsAt: "2026-10-24T11:00", endsAt: "2026-10-24T13:00" },
        )
        await seedEvent(
            headers,
            { venueId, categoryId },
            { startsAt: "2026-10-20T21:00", endsAt: "2026-10-20T23:30" },
        )

        const res = await getPublicVenue({
            headers: { "x-test-now": SATURDAY_NOON },
            pathParams: { venueId },
        })

        expectStatus(res, 200)
        expect(res.data).toStrictEqual({
            id: venue.id,
            name: venue.name,
            address: venue.address,
            coordinates: venue.coordinates,
            description: null,
            coverPhotoUrl: null,
            links: { websiteUrl: null, instagramUrl: null, facebookUrl: null },
            kind: "regular",
            programmeUrl: null,
            upcoming: [
                expect.objectContaining({ eventId: live.id, date: "2026-10-24" }),
                expect.objectContaining({ eventId: tonight.id, date: "2026-10-24" }),
            ],
        })
    })

    it("lists a repeating event once, with its next occurrence", async () => {
        const { headers } = await signInAs("organizer")
        const { categoryId, venueId } = await seedEventReferences()
        const weekly = await seedEvent(
            headers,
            { venueId, categoryId },
            {
                startsAt: "2026-10-17T21:00",
                endsAt: "2026-10-17T23:30",
                recurrence: buildWeeklyRecurrence("2026-11-07"),
            },
        )

        const res = await getPublicVenue({
            headers: { "x-test-now": SATURDAY_NOON },
            pathParams: { venueId },
        })

        expectStatus(res, 200)
        expect(
            res.data.upcoming.map(occurrence => [occurrence.eventId, occurrence.date]),
        ).toStrictEqual([[weekly.id, "2026-10-24"]])
    })

    it("leaves out a blocked event", async () => {
        const { headers } = await signInAs("organizer")
        const admin = await signInAs("admin")
        const { categoryId, venueId } = await seedEventReferences()
        const blocked = await seedEvent(headers, { venueId, categoryId })
        expectStatus(
            await blockEvent({
                headers: admin.headers,
                pathParams: { id: blocked.id },
                body: { reason: "Off-topic photos" },
            }),
            200,
        )

        const res = await getPublicVenue({
            headers: { "x-test-now": SATURDAY_NOON },
            pathParams: { venueId },
        })

        expectStatus(res, 200)
        expect(res.data.upcoming).toStrictEqual([])
    })

    it("answers the kind and the programme link once the venue becomes a cinema", async () => {
        const admin = await signInAs("admin")
        const { categoryId, venueId } = await seedEventReferences()
        const before = await getPublicVenue({ pathParams: { venueId } })
        expectStatus(before, 200)
        const cinema = buildCinemaKind(categoryId)
        expectStatus(
            await setVenueKind({
                headers: admin.headers,
                pathParams: { id: venueId },
                body: cinema,
            }),
            200,
        )

        const res = await getPublicVenue({ pathParams: { venueId } })

        expectStatus(res, 200)
        expect([before.data.kind, res.data.kind, res.data.programmeUrl]).toStrictEqual([
            "regular",
            "cinema",
            cinema.programmeUrl,
        ])
    })

    it("answers 404 for a blocked venue and for an unknown one", async () => {
        const admin = await signInAs("admin")
        const { venueId } = await seedEventReferences()
        expectStatus(
            await blockVenue({
                headers: admin.headers,
                pathParams: { id: venueId },
                body: { reason: "Closed for works" },
            }),
            200,
        )

        const [blocked, unknown] = await Promise.all([
            getPublicVenue({ pathParams: { venueId } }),
            getPublicVenue({ pathParams: { venueId: crypto.randomUUID() } }),
        ])

        expectApiError(blocked, 404, { code: "VenueNotFound" })
        expectApiError(unknown, 404, { code: "VenueNotFound" })
    })
})
