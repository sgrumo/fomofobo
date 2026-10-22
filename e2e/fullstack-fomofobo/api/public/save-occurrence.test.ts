import { expectApiError, expectStatus } from "e2e-kit/assertions"
import { describe, expect, it } from "vitest"

import { signInAs } from "../auth/utils"
import { seedEvent, seedEventReferences } from "../backoffice-events/utils"
import { updateSettings } from "../backoffice-settings/api"
import { getOccurrence, saveOccurrence, searchOccurrences, unsaveOccurrence } from "./api"
import { SATURDAY_NOON } from "./utils"

describe("PUT /api/public/saves/{eventId}/{date}", () => {
    it("counts each device once, and shows the count from the threshold up", async () => {
        const { headers } = await signInAs("organizer")
        const admin = await signInAs("admin")
        const { categoryId, venue, venueId } = await seedEventReferences()
        const event = await seedEvent(headers, { venueId, categoryId })
        expectStatus(
            await updateSettings({
                headers: admin.headers,
                body: { endedVisibleDays: 3, participantThreshold: 2 },
            }),
            200,
        )
        const client = {
            "x-test-now": SATURDAY_NOON,
            "x-forwarded-for": crypto.randomUUID(),
        }
        const pathParams = { eventId: event.id, date: "2026-10-24" }
        const [first, second] = [crypto.randomUUID(), crypto.randomUUID()]
        const countNow = async () => {
            const res = await getOccurrence({ headers: client, pathParams })
            expectStatus(res, 200)
            return res.data.interestedCount
        }

        for (const deviceId of [first, first]) {
            expectStatus(
                await saveOccurrence({ headers: client, pathParams, body: { deviceId } }),
                204,
            )
        }
        const underThreshold = await countNow()
        expectStatus(
            await saveOccurrence({
                headers: client,
                pathParams,
                body: { deviceId: second },
            }),
            204,
        )
        const atThreshold = await countNow()
        const search = await searchOccurrences({
            headers: client,
            queryParams: {
                lat: venue.coordinates.latitude,
                lng: venue.coordinates.longitude,
            },
        })
        expectStatus(search, 200)
        expectStatus(
            await unsaveOccurrence({
                headers: client,
                pathParams,
                body: { deviceId: second },
            }),
            204,
        )

        expect([
            underThreshold,
            atThreshold,
            search.data.occurrences.map(occurrence => occurrence.interestedCount),
            await countNow(),
        ]).toStrictEqual([null, 2, [2], null])
    })

    it("answers 404 for an occurrence that is not visible", async () => {
        const res = await saveOccurrence({
            headers: {
                "x-test-now": SATURDAY_NOON,
                "x-forwarded-for": crypto.randomUUID(),
            },
            pathParams: { eventId: crypto.randomUUID(), date: "2026-10-24" },
            body: { deviceId: crypto.randomUUID() },
        })

        expectApiError(res, 404, { code: "OccurrenceNotFound" })
    })

    it("answers 429 past 60 save calls of one client in ten minutes", async () => {
        const client = { "x-forwarded-for": crypto.randomUUID() }
        const pathParams = { eventId: crypto.randomUUID(), date: "2026-10-24" }
        const body = { deviceId: crypto.randomUUID() }
        // One call at a time: the window counts the calls in the order they land
        await Array.from({ length: 60 }).reduce<Promise<void>>(async previous => {
            await previous
            expectStatus(
                await unsaveOccurrence({ headers: client, pathParams, body }),
                204,
            )
        }, Promise.resolve())

        const res = await saveOccurrence({ headers: client, pathParams, body })

        expectApiError(res, 429, { code: "TooManyRequests" })
    })
})
