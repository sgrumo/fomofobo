import { describe, expect, it } from "vitest"

import { eventPageUrlOf } from "./public-page-urls"

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
