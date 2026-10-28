import { describe, expect, it } from "vitest"

import { eventDetailUrlOf, venueDetailUrlOf } from "./detail-urls"

describe("eventDetailUrlOf", () => {
    it("builds the web map URL with the occurrence detail open", () => {
        const eventId = crypto.randomUUID()

        expect(
            eventDetailUrlOf("https://fomofobo-dev.vercel.app", "it", {
                eventId,
                date: "2026-10-24",
            }),
        ).toBe(
            `https://fomofobo-dev.vercel.app/it?event=${eventId}&occurrence=2026-10-24&detail=true`,
        )
    })
})

describe("venueDetailUrlOf", () => {
    it("builds the web map URL with the venue detail open", () => {
        const venueId = crypto.randomUUID()

        expect(venueDetailUrlOf("https://fomofobo-dev.vercel.app", "it", venueId)).toBe(
            `https://fomofobo-dev.vercel.app/it?venue=${venueId}&detail=true`,
        )
    })
})
