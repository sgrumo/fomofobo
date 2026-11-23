import type { Event } from "models"
import { eventUpsertSchema } from "models"
import { describe, expect, it } from "vitest"

import { parseToolInput, toEventUpsert } from "./mcp-tool-input"

const event: Event = {
    id: "0d105808-da4d-4bf2-9acf-3b3ebd2f6461",
    title: "Jazz al Chiostro",
    description: null,
    categoryIds: ["c0532afe-a916-4b3f-92a1-169c8970d32a"],
    primaryCategoryId: "c0532afe-a916-4b3f-92a1-169c8970d32a",
    venue: {
        id: "220ab5ed-0104-4985-99db-3764dbba8ce8",
        name: "Chiostro",
        address: "Via Emilia 10",
        coordinates: { latitude: 44.35, longitude: 11.71 },
    },
    startsAt: "2026-10-24T21:00",
    endsAt: "2026-10-24T23:30",
    recurrence: null,
    photos: [
        {
            id: "6c6f1d0e-7a3b-4f43-9a0c-1d2e3f4a5b6c",
            key: "events/a/second",
            url: "https://photos.example/second",
            naturalUrl: null,
            position: 1,
        },
        {
            id: "7d7f2e1f-8b4c-4a54-8b1d-2e3f4a5b6c7d",
            key: "events/a/cover",
            url: "https://photos.example/cover",
            naturalUrl: null,
            position: 0,
        },
    ],
    externalLinks: { instagramUrl: null, facebookUrl: null },
    priceScheme: {
        isFree: true,
        fullPriceCents: null,
        reducedPrices: [],
        membership: null,
        minimumAge: null,
        notes: null,
    },
    capacity: null,
    organizer: { id: "8213181f-08e4-46ce-8afc-2fb11edec5c9", name: "Rocca Eventi" },
    isBlocked: false,
    blockReason: null,
    createdAt: "2026-10-01T09:00:00.000Z",
    updatedAt: "2026-10-01T09:00:00.000Z",
}

describe("toEventUpsert", () => {
    it("should write the event back with its photos in gallery order and its organizer", () => {
        expect(toEventUpsert(event)).toStrictEqual({
            title: "Jazz al Chiostro",
            description: null,
            categoryIds: ["c0532afe-a916-4b3f-92a1-169c8970d32a"],
            primaryCategoryId: "c0532afe-a916-4b3f-92a1-169c8970d32a",
            venueId: "220ab5ed-0104-4985-99db-3764dbba8ce8",
            startsAt: "2026-10-24T21:00",
            endsAt: "2026-10-24T23:30",
            recurrence: null,
            photoKeys: ["events/a/cover", "events/a/second"],
            externalLinks: { instagramUrl: null, facebookUrl: null },
            priceScheme: event.priceScheme,
            capacity: null,
            organizerId: "8213181f-08e4-46ce-8afc-2fb11edec5c9",
        })
    })
})

describe("parseToolInput", () => {
    it("should return the parsed value", () => {
        const upsert = toEventUpsert(event)

        expect(parseToolInput(eventUpsertSchema, upsert)).toStrictEqual(upsert)
    })

    it("should name each failing field with the message of its refinement", () => {
        const upsert = { ...toEventUpsert(event), endsAt: "2026-10-24T20:00" }

        expect(() => parseToolInput(eventUpsertSchema, upsert)).toThrow(
            expect.objectContaining({
                code: "InvalidRequest",
                message: "endsAt: must be after the start",
            }),
        )
    })

    it("should name a field that fails its type", () => {
        expect(() =>
            parseToolInput(eventUpsertSchema, { ...toEventUpsert(event), title: 42 }),
        ).toThrow(/^title: /u)
    })
})
