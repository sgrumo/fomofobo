import { expectApiError, expectStatus, expectToBeDefined } from "e2e-kit/assertions"
import { describe, expect, it } from "vitest"

import { signInAs } from "../auth/utils"
import { createCategory, updateCategory } from "../backoffice-categories/api"
import {
    buildCategoryCreation,
    uploadCategoryImage,
} from "../backoffice-categories/utils"
import { blockEvent, updateEvent } from "../backoffice-events/api"
import {
    buildEventUpsert,
    buildWeeklyRecurrence,
    seedEvent,
    seedEventReferences,
    uploadPhoto,
} from "../backoffice-events/utils"
import { updateSettings } from "../backoffice-settings/api"
import { blockVenue, createVenue, updateVenue } from "../backoffice-venues/api"
import { buildVenueCreation, uploadVenueCover } from "../backoffice-venues/utils"
import { getOccurrence } from "./api"
import { SATURDAY_NOON } from "./utils"

describe("GET /api/public/occurrences/{eventId}/{date}", () => {
    it("answers the occurrence with its venue address, photos and links", async () => {
        const { headers } = await signInAs("organizer")
        const { categoryId, venue, venueId } = await seedEventReferences()
        const event = await seedEvent(headers, { venueId, categoryId })

        const res = await getOccurrence({
            headers: { "x-test-now": SATURDAY_NOON },
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
                isBlocked: false,
            },
            categoryIds: [categoryId],
            primaryCategoryId: categoryId,
            coverPhotoUrl: event.photos[0]?.url,
            priceScheme: event.priceScheme,
            photos: event.photos.map(({ id, url, position }) => ({ id, url, position })),
            externalLinks: event.externalLinks,
            capacity: event.capacity,
        })
    })

    it("covers an event with no photo by the venue cover, else the category image, else the icon image", async () => {
        const organizer = await signInAs("organizer")
        const admin = await signInAs("admin")
        const [music, art, coveredVenue, bareVenue] = await Promise.all([
            createCategory({
                headers: admin.headers,
                body: { ...buildCategoryCreation(), icon: "music" },
            }),
            createCategory({
                headers: admin.headers,
                body: { ...buildCategoryCreation(), icon: "art" },
            }),
            createVenue({ headers: admin.headers, body: buildVenueCreation() }),
            createVenue({ headers: admin.headers, body: buildVenueCreation() }),
        ])
        expectStatus(music, 201)
        expectStatus(art, 201)
        expectStatus(coveredVenue, 201)
        expectStatus(bareVenue, 201)
        const image = await uploadCategoryImage(art.data.id)
        const withImage = await updateCategory({
            headers: admin.headers,
            pathParams: { id: art.data.id },
            body: { imageKey: image.key },
        })
        expectStatus(withImage, 200)
        const cover = await uploadVenueCover(admin.headers, coveredVenue.data.id)
        const withCover = await updateVenue({
            headers: admin.headers,
            pathParams: { id: coveredVenue.data.id },
            body: { coverPhotoKey: cover.key },
        })
        expectStatus(withCover, 200)
        const events = await Promise.all(
            [
                { venueId: coveredVenue.data.id, categoryId: art.data.id },
                { venueId: bareVenue.data.id, categoryId: art.data.id },
                { venueId: bareVenue.data.id, categoryId: music.data.id },
            ].map(refs => seedEvent(organizer.headers, refs, { photoKeys: [] })),
        )

        const covers = await Promise.all(
            events.map(async event => {
                const res = await getOccurrence({
                    headers: { "x-test-now": SATURDAY_NOON },
                    pathParams: { eventId: event.id, date: "2026-10-24" },
                })
                expectStatus(res, 200)
                return res.data.coverPhotoUrl
            }),
        )

        expect(covers).toStrictEqual([
            withCover.data.coverPhotoUrl,
            withImage.data.imageUrl,
            expect.stringMatching(/\/fallbacks\/music\.png$/u),
        ])
        const iconUrl = covers.at(-1)
        expectToBeDefined(iconUrl)
        const iconImage = await fetch(iconUrl)
        expect([iconImage.status, iconImage.headers.get("content-type")]).toStrictEqual([
            200,
            "image/png",
        ])
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
            getOccurrence({
                headers: { "x-test-now": SATURDAY_NOON },
                pathParams: { eventId: event.id, date: "2026-10-31" },
            }),
            getOccurrence({
                headers: { "x-test-now": SATURDAY_NOON },
                pathParams: { eventId: event.id, date: "2026-11-01" },
            }),
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
            headers: { "x-test-now": SATURDAY_NOON },
            pathParams: { eventId: event.id, date: "2026-10-24" },
        })

        expectStatus(res, 200)
        expect(res.data).toMatchObject({
            date: "2026-11-07",
            startsAt: "2026-11-07T20:00:00.000Z",
        })
    })

    it("answers 404 once the occurrence ended three days ago", async () => {
        const { headers } = await signInAs("organizer")
        const { categoryId, venueId } = await seedEventReferences()
        const event = await seedEvent(headers, { venueId, categoryId })
        const ref = { eventId: event.id, date: "2026-10-24" }

        const [lastMinute, expired] = await Promise.all([
            getOccurrence({
                headers: { "x-test-now": "2026-10-27T21:29:00.000Z" },
                pathParams: ref,
            }),
            getOccurrence({
                headers: { "x-test-now": "2026-10-27T21:30:00.000Z" },
                pathParams: ref,
            }),
        ])

        expectStatus(lastMinute, 200)
        expectApiError(expired, 404, { code: "OccurrenceNotFound" })
    })

    it("answers 404 once the occurrence ended the retention days an Admin saved", async () => {
        const { headers } = await signInAs("organizer")
        const admin = await signInAs("admin")
        const { categoryId, venueId } = await seedEventReferences()
        const event = await seedEvent(headers, { venueId, categoryId })
        const ref = { eventId: event.id, date: "2026-10-24" }
        expectStatus(
            await updateSettings({
                headers: admin.headers,
                body: { endedVisibleDays: 1, participantThreshold: 20 },
            }),
            200,
        )

        const [lastMinute, expired] = await Promise.all([
            getOccurrence({
                headers: { "x-test-now": "2026-10-25T21:29:00.000Z" },
                pathParams: ref,
            }),
            getOccurrence({
                headers: { "x-test-now": "2026-10-25T21:30:00.000Z" },
                pathParams: ref,
            }),
        ])

        expectStatus(lastMinute, 200)
        expectApiError(expired, 404, { code: "OccurrenceNotFound" })
    })

    it("keeps the occurrence of a blocked venue and flags the venue", async () => {
        const { headers } = await signInAs("organizer")
        const admin = await signInAs("admin")
        const { categoryId, venueId } = await seedEventReferences()
        const event = await seedEvent(headers, { venueId, categoryId })
        expectStatus(
            await blockVenue({
                headers: admin.headers,
                pathParams: { id: venueId },
                body: { reason: "Closed for works" },
            }),
            200,
        )

        const res = await getOccurrence({
            headers: { "x-test-now": SATURDAY_NOON },
            pathParams: { eventId: event.id, date: "2026-10-24" },
        })

        expectStatus(res, 200)
        expect(res.data.venue).toMatchObject({ id: venueId, isBlocked: true })
    })

    it("answers 404 on the next request once an Admin blocks the event", async () => {
        const { headers } = await signInAs("organizer")
        const admin = await signInAs("admin")
        const { categoryId, venueId } = await seedEventReferences()
        const event = await seedEvent(headers, { venueId, categoryId })
        const ref = { eventId: event.id, date: "2026-10-24" }
        expectStatus(
            await getOccurrence({
                headers: { "x-test-now": SATURDAY_NOON },
                pathParams: ref,
            }),
            200,
        )
        expectStatus(
            await blockEvent({
                headers: admin.headers,
                pathParams: { id: event.id },
                body: { reason: "Spam" },
            }),
            200,
        )

        const res = await getOccurrence({
            headers: { "x-test-now": SATURDAY_NOON },
            pathParams: ref,
        })

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
        expectStatus(
            await getOccurrence({
                headers: { "x-test-now": SATURDAY_NOON },
                pathParams: removed,
            }),
            200,
        )
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
            getOccurrence({
                headers: { "x-test-now": SATURDAY_NOON },
                pathParams: removed,
            }),
            getOccurrence({
                headers: { "x-test-now": SATURDAY_NOON },
                pathParams: { eventId: event.id, date: "2026-11-11" },
            }),
        ])
        expectApiError(gone, 404, { code: "OccurrenceNotFound" })
        expectStatus(added, 200)
    })
})
