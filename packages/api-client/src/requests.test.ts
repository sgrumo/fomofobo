import { MutationObserver, QueryClient } from "@tanstack/react-query"
import { MAX_LOOKUP_REFS } from "models"
import type { Account, Category, Event, EventUpsert, Venue } from "models"
import { describe, expect, it, vi } from "vitest"

import type { ApiRequest } from "./client"
import { createApi } from "./requests"

const venue: Venue = {
    id: "b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d01",
    name: "Rocca Sforzesca",
    address: "Piazzale Giovanni dalle Bande Nere, Imola",
    coordinates: { latitude: 44.3521, longitude: 11.7096 },
    description: null,
    coverPhotoUrl: null,
    links: { websiteUrl: null, instagramUrl: null, facebookUrl: null },
    kind: "regular",
    programmeUrl: null,
    categoryId: null,
    owner: null,
    isBlocked: false,
    blockReason: null,
}

const category: Category = {
    id: "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c01",
    name: "Musica",
    icon: "music",
}

const organizer: Account = {
    id: "4b7e9c2d-1a3f-4d6b-8e5c-7f2a9b1c3d50",
    name: "Rocca Eventi",
    email: "rocca@fomofobo.local",
    role: "organizer",
    isBlocked: false,
    createdAt: "2026-10-15T10:00:00.000Z",
}

const event: Event = {
    id: "3f1a6d2e-9b7c-4c1f-8a2d-5e6f7a8b9c0d",
    title: "Jazz in Rocca",
    description: null,
    categoryIds: [category.id],
    primaryCategoryId: category.id,
    venue,
    startsAt: "2026-10-16T21:00",
    endsAt: "2026-10-16T23:00",
    recurrence: null,
    photos: [],
    externalLinks: { instagramUrl: null, facebookUrl: null },
    price: null,
    organizer: { id: organizer.id, name: organizer.name },
    isBlocked: false,
    blockReason: null,
    createdAt: "2026-10-15T10:00:00.000Z",
    updatedAt: "2026-10-15T10:00:00.000Z",
}

const eventUpsert: EventUpsert = {
    title: event.title,
    description: null,
    categoryIds: [category.id],
    primaryCategoryId: category.id,
    venueId: venue.id,
    startsAt: event.startsAt,
    endsAt: event.endsAt,
    recurrence: null,
    photoKeys: ["events/photo.webp"],
    externalLinks: { instagramUrl: null, facebookUrl: null },
    price: null,
}

/**
 * @description Builds an api whose transport resolves the response, and a spy on the invalidations
 * @param response Value resolved by the transport
 */
const apiReturning = (response: unknown) => {
    const client = new QueryClient()
    const invalidateQueries = vi.spyOn(client, "invalidateQueries")
    const request = vi.fn<(request: ApiRequest) => Promise<unknown>>(() =>
        Promise.resolve(response),
    )
    return { client, invalidateQueries, request, api: createApi({ request }) }
}

describe("mutation invalidations", () => {
    it("invalidates the backoffice events after each event write", async () => {
        const { client, invalidateQueries, api } = apiReturning(event)

        await new MutationObserver(client, api.createEventMutation).mutate(eventUpsert)
        await new MutationObserver(client, api.updateEventMutation).mutate({
            id: event.id,
            body: eventUpsert,
        })
        await new MutationObserver(client, api.deleteEventMutation).mutate({
            id: event.id,
        })
        await new MutationObserver(client, api.blockEventMutation).mutate({
            id: event.id,
            body: { reason: "Spam" },
        })
        await new MutationObserver(client, api.unblockEventMutation).mutate({
            id: event.id,
        })

        expect(invalidateQueries.mock.calls).toStrictEqual([
            [{ queryKey: ["backofficeEvents"] }],
            [{ queryKey: ["backofficeEvents"] }],
            [{ queryKey: ["backofficeEvents"] }],
            [{ queryKey: ["backofficeEvents"] }],
            [{ queryKey: ["backofficeEvents"] }],
        ])
    })

    it("invalidates the categories after each category write", async () => {
        const { client, invalidateQueries, api } = apiReturning(category)

        await new MutationObserver(client, api.createCategoryMutation).mutate({
            name: category.name,
            icon: category.icon,
        })
        await new MutationObserver(client, api.updateCategoryMutation).mutate({
            id: category.id,
            body: { name: "Concerti" },
        })
        await new MutationObserver(client, api.deleteCategoryMutation).mutate({
            id: category.id,
        })

        expect(invalidateQueries.mock.calls).toStrictEqual([
            [{ queryKey: ["categories"] }],
            [{ queryKey: ["categories"] }],
            [{ queryKey: ["categories"] }],
        ])
    })

    it("invalidates the venues and the backoffice events after each venue write", async () => {
        const { client, invalidateQueries, api } = apiReturning(venue)

        await new MutationObserver(client, api.createVenueMutation).mutate({
            name: venue.name,
            address: venue.address,
            coordinates: venue.coordinates,
        })
        await new MutationObserver(client, api.updateVenueMutation).mutate({
            id: venue.id,
            body: { name: "Rocca" },
        })

        expect(invalidateQueries.mock.calls).toStrictEqual([
            [{ queryKey: ["venues"] }],
            [{ queryKey: ["backofficeEvents"] }],
            [{ queryKey: ["venues"] }],
            [{ queryKey: ["backofficeEvents"] }],
        ])
    })

    it("invalidates the organizers and the backoffice events after each organizer write", async () => {
        const { client, invalidateQueries, api } = apiReturning(organizer)

        await new MutationObserver(client, api.createOrganizerMutation).mutate({
            name: organizer.name,
            email: organizer.email,
            password: "correct-horse-battery",
        })
        await new MutationObserver(client, api.blockOrganizerMutation).mutate({
            id: organizer.id,
        })
        await new MutationObserver(client, api.unblockOrganizerMutation).mutate({
            id: organizer.id,
        })
        await new MutationObserver(client, api.setOrganizerPasswordMutation).mutate({
            id: organizer.id,
            body: { password: "correct-horse-staple" },
        })

        expect(invalidateQueries.mock.calls).toStrictEqual([
            [{ queryKey: ["organizers"] }],
            [{ queryKey: ["backofficeEvents"] }],
            [{ queryKey: ["organizers"] }],
            [{ queryKey: ["backofficeEvents"] }],
            [{ queryKey: ["organizers"] }],
            [{ queryKey: ["backofficeEvents"] }],
            [{ queryKey: ["organizers"] }],
            [{ queryKey: ["backofficeEvents"] }],
        ])
    })

    it("invalidates the settings after a settings write", async () => {
        const { client, invalidateQueries, api } = apiReturning({
            endedVisibleDays: 5,
            participantThreshold: 30,
            updatedAt: "2026-10-21T10:00:00.000Z",
            updatedBy: { id: organizer.id, name: organizer.name },
        })

        await new MutationObserver(client, api.updateSettingsMutation).mutate({
            endedVisibleDays: 5,
            participantThreshold: 30,
        })

        expect(invalidateQueries.mock.calls).toStrictEqual([[{ queryKey: ["settings"] }]])
    })
})

describe("lookupOccurrences", () => {
    it("splits the refs past the cap of one call into chunks, in ref order", async () => {
        const { request, api } = apiReturning([])
        const refs = Array.from(
            { length: MAX_LOOKUP_REFS + 1 },
            (_, index) =>
                `${event.id}:2026-10-${String((index % 28) + 1).padStart(2, "0")}`,
        )

        await expect(
            api.lookupOccurrences({ params: {}, query: { ref: refs } }),
        ).resolves.toStrictEqual([])

        expect(request.mock.calls.map(([call]) => call.query)).toStrictEqual([
            { ref: refs.slice(0, MAX_LOOKUP_REFS) },
            { ref: refs.slice(MAX_LOOKUP_REFS) },
        ])
    })
})
