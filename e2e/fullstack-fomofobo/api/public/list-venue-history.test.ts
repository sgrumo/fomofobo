import { expectApiError, expectStatus } from "e2e-kit/assertions"
import { describe, expect, it } from "vitest"

import { signInAs } from "../auth/utils"
import { blockEvent } from "../backoffice-events/api"
import {
    buildWeeklyRecurrence,
    seedEvent,
    seedEventReferences,
} from "../backoffice-events/utils"
import { blockVenue } from "../backoffice-venues/api"
import { listVenueHistory } from "./api"
import { SATURDAY_NOON } from "./utils"

describe("GET /api/public/venues/{venueId}/history", () => {
    it("pages the past events, newest end first, with their first and last date", async () => {
        const { headers } = await signInAs("organizer")
        const { categoryId, venueId } = await seedEventReferences()
        const single = await seedEvent(
            headers,
            { venueId, categoryId },
            { startsAt: "2026-10-20T21:00", endsAt: "2026-10-20T23:30" },
        )
        const weekly = await seedEvent(
            headers,
            { venueId, categoryId },
            {
                startsAt: "2026-10-03T21:00",
                endsAt: "2026-10-03T23:30",
                recurrence: buildWeeklyRecurrence("2026-10-17"),
            },
        )
        await seedEvent(headers, { venueId, categoryId })

        const [first, second] = await Promise.all([
            listVenueHistory({
                headers: { "x-test-now": SATURDAY_NOON },
                pathParams: { venueId },
                queryParams: { page: 1, pageSize: 1 },
            }),
            listVenueHistory({
                headers: { "x-test-now": SATURDAY_NOON },
                pathParams: { venueId },
                queryParams: { page: 2, pageSize: 1 },
            }),
        ])

        expectStatus(first, 200)
        expectStatus(second, 200)
        expect(first.data).toStrictEqual({
            items: [
                {
                    eventId: single.id,
                    title: single.title,
                    categoryIds: [categoryId],
                    firstDate: "2026-10-20",
                    lastDate: "2026-10-20",
                },
            ],
            total: 2,
            page: 1,
            pageSize: 1,
            totalPages: 2,
        })
        expect(second.data.items).toStrictEqual([
            {
                eventId: weekly.id,
                title: weekly.title,
                categoryIds: [categoryId],
                firstDate: "2026-10-03",
                lastDate: "2026-10-17",
            },
        ])
    })

    it("leaves out a blocked event", async () => {
        const { headers } = await signInAs("organizer")
        const admin = await signInAs("admin")
        const { categoryId, venueId } = await seedEventReferences()
        const blocked = await seedEvent(
            headers,
            { venueId, categoryId },
            { startsAt: "2026-10-20T21:00", endsAt: "2026-10-20T23:30" },
        )
        expectStatus(
            await blockEvent({
                headers: admin.headers,
                pathParams: { id: blocked.id },
                body: { reason: "Off-topic photos" },
            }),
            200,
        )

        const res = await listVenueHistory({
            headers: { "x-test-now": SATURDAY_NOON },
            pathParams: { venueId },
            queryParams: {},
        })

        expectStatus(res, 200)
        expect(res.data.items).toStrictEqual([])
    })

    it("answers 404 for a blocked venue", async () => {
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

        const res = await listVenueHistory({ pathParams: { venueId }, queryParams: {} })

        expectApiError(res, 404, { code: "VenueNotFound" })
    })
})
