import { describe, expect, it } from "vitest"

import {
    isMapTileUrl,
    isNetworkOnlyPath,
    isPublicDataPath,
    isSearchPath,
    isTileJsonUrl,
    searchFiltersKey,
} from "./request-rules"

describe("isNetworkOnlyPath", () => {
    it.each([
        "/backoffice",
        "/backoffice/events/new",
        "/api/backoffice/events",
        "/api/auth/sign-in/email",
        "/api/test/reset-database",
        "/auth/logout",
    ])("leaves %s to the network", pathname => {
        expect(isNetworkOnlyPath(pathname)).toBe(true)
    })

    it.each([
        "/it",
        "/it/saved",
        "/en/events/id/2026-10-18",
        "/api/public/categories",
        "/backoffices",
    ])("lets the worker handle %s", pathname => {
        expect(isNetworkOnlyPath(pathname)).toBe(false)
    })
})

describe("isPublicDataPath", () => {
    it.each([
        ["/api/public/categories", true],
        ["/api/public/occurrences", true],
        ["/api/public/occurrences/lookup", true],
        ["/api/public/occurrences/id/2026-10-18", true],
        ["/api/public/places", false],
        ["/api/backoffice/events", false],
    ])("reads %s as cached public data: %s", (pathname, expected) => {
        expect(isPublicDataPath(pathname)).toBe(expected)
    })
})

describe("isSearchPath", () => {
    it("matches the search alone", () => {
        expect(isSearchPath("/api/public/occurrences")).toBe(true)
        expect(isSearchPath("/api/public/occurrences/lookup")).toBe(false)
    })
})

describe("searchFiltersKey", () => {
    it("gives two centers with the same filters one key", () => {
        const first = new URL(
            "https://fomofobo.test/api/public/occurrences?lat=44.35&lng=11.71&date=today&categoryIds=a",
        )
        const second = new URL(
            "https://fomofobo.test/api/public/occurrences?categoryIds=a&date=today&lat=45.1&lng=9.2",
        )

        expect(searchFiltersKey(first)).toBe(searchFiltersKey(second))
    })

    it("gives two filters two keys", () => {
        const first = new URL(
            "https://fomofobo.test/api/public/occurrences?lat=1&lng=2&date=today",
        )
        const second = new URL(
            "https://fomofobo.test/api/public/occurrences?lat=1&lng=2&date=weekend",
        )

        expect(searchFiltersKey(first)).not.toBe(searchFiltersKey(second))
    })
})

describe("tile URLs", () => {
    it("tells the TileJSON from the tiles and glyphs", () => {
        const tileJson = new URL("https://tiles.openfreemap.org/planet")
        const tile = new URL(
            "https://tiles.openfreemap.org/planet/20261015_001001_pt/14/8710/5945.pbf",
        )
        const glyphs = new URL(
            "https://tiles.openfreemap.org/fonts/Noto%20Sans%20Regular/0-255.pbf",
        )

        expect(isTileJsonUrl(tileJson)).toBe(true)
        expect(isMapTileUrl(tileJson)).toBe(false)
        expect(isMapTileUrl(tile)).toBe(true)
        expect(isMapTileUrl(glyphs)).toBe(true)
        expect(isMapTileUrl(new URL("https://photos.fomofobo.test/events/a.jpg"))).toBe(
            false,
        )
    })
})
