import { describe, expect, it } from "vitest"

import { appLinkPathsOf, appPathOf } from "./app-links"
import { eventDetailUrlOf, venueDetailUrlOf } from "./detail-urls"

describe("appLinkPathsOf", () => {
    it("builds the map path of each language", () => {
        expect(appLinkPathsOf(["it", "en"])).toStrictEqual(["/it/map", "/en/map"])
    })
})

describe("appPathOf", () => {
    it("maps a shared event link to the map screen with the same query", () => {
        const eventId = crypto.randomUUID()
        const link = eventDetailUrlOf("https://www.zonzo.live", "it", {
            eventId,
            date: "2026-10-24",
        })

        expect(appPathOf(link)).toBe(
            `/?event=${eventId}&occurrence=2026-10-24&detail=true`,
        )
    })

    it("maps a shared venue link to the map screen with the same query", () => {
        const venueId = crypto.randomUUID()
        const link = venueDetailUrlOf("https://www.zonzo.live", "it", venueId)

        expect(appPathOf(link)).toBe(`/?venue=${venueId}&detail=true`)
    })

    it("maps a map link with no query, a trailing slash or a fragment", () => {
        expect(appPathOf("https://www.zonzo.live/it/map")).toBe("/")
        expect(appPathOf("https://www.zonzo.live/it/map/?q=jazz")).toBe("/?q=jazz")
        expect(appPathOf("https://www.zonzo.live/it/map?q=jazz#top")).toBe("/?q=jazz")
    })

    it("leaves every other link unmapped", () => {
        expect(
            [
                "zonzo:///",
                "zonzo:///?event=x",
                "https://www.zonzo.live/it",
                "https://www.zonzo.live/it/privacy",
                "https://www.zonzo.live/it/mapping",
                "https://www.zonzo.live/backoffice/events",
                "http://www.zonzo.live/it/map",
            ].map(appPathOf),
        ).toStrictEqual(Array.from({ length: 7 }, () => undefined))
    })
})
