import { QueryClient, queryOptions } from "@tanstack/react-query"
import { isEqual } from "es-toolkit"
import { describe, expect, it, vi } from "vitest"

import { isSameSearchFilters, latestQueryData } from "./cached-answers"

const searchQuery = {
    lat: 44.3536,
    lng: 11.7149,
    q: undefined,
    categoryIds: undefined,
    free: true,
    date: "default",
    from: undefined,
    to: undefined,
}

describe("isSameSearchFilters", () => {
    it("ignores the center of the search", () => {
        const key = [
            "publicOccurrences",
            "search",
            { params: {}, query: { ...searchQuery, lat: 41.9, lng: 12.5 } },
        ]

        expect(isSameSearchFilters(key, searchQuery)).toBe(true)
    })

    it("tells apart a search with another free filter", () => {
        const key = [
            "publicOccurrences",
            "search",
            { params: {}, query: { ...searchQuery, free: undefined } },
        ]

        expect(isSameSearchFilters(key, searchQuery)).toBe(false)
    })

    it("rejects a key with no search variables", () => {
        expect(isSameSearchFilters(["publicOccurrences", "search"], searchQuery)).toBe(
            false,
        )
    })
})

describe("latestQueryData", () => {
    const lookupKey = queryOptions({
        queryKey: ["publicOccurrences", "lookup", { refs: 3 }],
        queryFn: () => "current",
    }).queryKey

    it("returns the data of the newest answer of the same kind that the predicate accepts", () => {
        vi.useFakeTimers()
        const client = new QueryClient()
        vi.setSystemTime(Date.parse("2026-10-24T10:00:00Z"))
        client.setQueryData(["publicOccurrences", "lookup", { refs: 1 }], "older")
        vi.setSystemTime(Date.parse("2026-10-24T11:00:00Z"))
        client.setQueryData(["publicOccurrences", "lookup", { refs: 2 }], "newer")
        client.setQueryData(["publicOccurrences", "lookup", { refs: 9 }], "rejected")
        client.setQueryData(["categories", "list"], "other")
        vi.useRealTimers()

        expect(
            latestQueryData(
                client,
                lookupKey,
                cachedKey => !isEqual(cachedKey[2], { refs: 9 }),
            ),
        ).toBe("newer")
    })

    it("returns undefined when no answer of the kind is cached", () => {
        expect(latestQueryData(new QueryClient(), lookupKey, () => true)).toBeUndefined()
    })
})
