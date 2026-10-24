import { describe, expect, it } from "vitest"

import { isPersistedQuery } from "./persisted-queries"

const now = Date.parse("2026-10-24T12:00:00Z")
const dayMs = 24 * 60 * 60 * 1000

/**
 * @description Builds the part of a cache query that the persist filter reads
 * @param queryKey Key of the query
 * @param state Status and age of its data
 */
const queryOf = (
    queryKey: readonly unknown[],
    state: { status: "success" | "error" | "pending"; dataUpdatedAt: number },
) => ({ queryKey, state })

describe("isPersistedQuery", () => {
    it("keeps the public reads of occurrences, venues and categories", () => {
        const fresh: { status: "success"; dataUpdatedAt: number } = {
            status: "success",
            dataUpdatedAt: now,
        }

        expect(
            [
                ["publicOccurrences", "detail", {}],
                ["publicOccurrences", "lookup", {}],
                ["publicVenues", "detail", {}],
                ["publicVenues", "pages", {}],
                ["categories", "list", {}],
            ].map(queryKey => isPersistedQuery(queryOf(queryKey, fresh), now)),
        ).toStrictEqual([true, true, true, true, true])
    })

    it("drops the place suggestions, the version gate and a failed read", () => {
        expect(
            [
                queryOf(["places", "search", {}], {
                    status: "success",
                    dataUpdatedAt: now,
                }),
                queryOf(["clientCompatibility"], {
                    status: "success",
                    dataUpdatedAt: now,
                }),
                queryOf(["publicVenues", "detail", {}], {
                    status: "error",
                    dataUpdatedAt: 0,
                }),
            ].map(query => isPersistedQuery(query, now)),
        ).toStrictEqual([false, false, false])
    })

    it("keeps a search of the last seven days alone", () => {
        const search = ["publicOccurrences", "search", {}]

        expect(
            [now - 7 * dayMs, now - 8 * dayMs].map(dataUpdatedAt =>
                isPersistedQuery(
                    queryOf(search, { status: "success", dataUpdatedAt }),
                    now,
                ),
            ),
        ).toStrictEqual([true, false])
    })
})
