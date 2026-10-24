import { describe, expect, it } from "vitest"

import { eventPageUrlOf, venuePageUrlOf } from "./public-page-urls"

describe("eventPageUrlOf", () => {
    it("builds the path of the web event page under the origin", () => {
        const eventId = crypto.randomUUID()

        expect(
            eventPageUrlOf("https://fomofobo-dev.vercel.app", "it", {
                eventId,
                date: "2026-10-24",
            }),
        ).toBe(`https://fomofobo-dev.vercel.app/it/events/${eventId}/2026-10-24`)
    })
})

describe("venuePageUrlOf", () => {
    it("builds the path of the web venue page under the origin", () => {
        const venueId = crypto.randomUUID()

        expect(venuePageUrlOf("https://fomofobo-dev.vercel.app", "it", venueId)).toBe(
            `https://fomofobo-dev.vercel.app/it/venues/${venueId}`,
        )
    })
})
