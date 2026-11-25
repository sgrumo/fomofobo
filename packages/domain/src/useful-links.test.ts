import { describe, expect, it } from "vitest"

import { eventUsefulLinksOf, venueUsefulLinksOf } from "./useful-links"

const venueLinks = {
    websiteUrl: "https://www.chiostro.it",
    instagramUrl: "https://www.instagram.com/chiostro",
    facebookUrl: "https://www.facebook.com/chiostro",
}

const noLinks = { websiteUrl: null, instagramUrl: null, facebookUrl: null }

describe("venueUsefulLinksOf", () => {
    it("lists the website, Instagram and Facebook in this order", () => {
        expect(venueUsefulLinksOf(venueLinks)).toStrictEqual([
            { type: "website", url: venueLinks.websiteUrl },
            { type: "instagram", url: venueLinks.instagramUrl },
            { type: "facebook", url: venueLinks.facebookUrl },
        ])
    })

    it("leaves out the links the venue lacks", () => {
        expect(
            venueUsefulLinksOf({ ...noLinks, facebookUrl: venueLinks.facebookUrl }),
        ).toStrictEqual([{ type: "facebook", url: venueLinks.facebookUrl }])
    })
})

describe("eventUsefulLinksOf", () => {
    it("takes the links of the venue when the event has none", () => {
        expect(
            eventUsefulLinksOf({ instagramUrl: null, facebookUrl: null }, venueLinks),
        ).toStrictEqual(venueUsefulLinksOf(venueLinks))
    })

    it("puts the link of the event in place of the venue link of the same platform", () => {
        const instagramUrl = "https://www.instagram.com/p/party"

        expect(
            eventUsefulLinksOf({ instagramUrl, facebookUrl: null }, venueLinks),
        ).toStrictEqual([
            { type: "website", url: venueLinks.websiteUrl },
            { type: "instagram", url: instagramUrl },
            { type: "facebook", url: venueLinks.facebookUrl },
        ])
    })

    it("keeps the links of the event at a venue with no links", () => {
        const facebookUrl = "https://www.facebook.com/events/1"

        expect(
            eventUsefulLinksOf({ instagramUrl: null, facebookUrl }, noLinks),
        ).toStrictEqual([{ type: "facebook", url: facebookUrl }])
    })
})
