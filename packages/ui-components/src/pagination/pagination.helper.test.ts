import { describe, expect, it } from "vitest"

import { getPaginationRange } from "./pagination.helper"

describe("getPaginationRange", () => {
    describe("with the default single sibling", () => {
        it("lists every page without ellipsis when they fit", () => {
            expect(getPaginationRange(1, 3, { siblingCount: 1 })).toStrictEqual([
                { type: "page", page: 1, key: "page-0" },
                { type: "page", page: 2, key: "page-1" },
                { type: "page", page: 3, key: "page-2" },
            ])
        })

        it("collapses both sides when the current page sits in the middle", () => {
            expect(getPaginationRange(10, 20, { siblingCount: 1 })).toStrictEqual([
                { type: "page", page: 1, key: "page-0" },
                { type: "ellipsis", key: "ellipsis-start-1" },
                { type: "page", page: 9, key: "page-2" },
                { type: "page", page: 10, key: "page-3" },
                { type: "page", page: 11, key: "page-4" },
                { type: "ellipsis", key: "ellipsis-end-5" },
                { type: "page", page: 20, key: "page-6" },
            ])
        })

        it("only collapses the right side near the start", () => {
            expect(getPaginationRange(2, 20, { siblingCount: 1 })).toStrictEqual([
                { type: "page", page: 1, key: "page-0" },
                { type: "page", page: 2, key: "page-1" },
                { type: "page", page: 3, key: "page-2" },
                { type: "page", page: 4, key: "page-3" },
                { type: "page", page: 5, key: "page-4" },
                { type: "ellipsis", key: "ellipsis-end-5" },
                { type: "page", page: 20, key: "page-6" },
            ])
        })

        it("only collapses the left side near the end", () => {
            expect(getPaginationRange(19, 20, { siblingCount: 1 })).toStrictEqual([
                { type: "page", page: 1, key: "page-0" },
                { type: "ellipsis", key: "ellipsis-start-1" },
                { type: "page", page: 16, key: "page-2" },
                { type: "page", page: 17, key: "page-3" },
                { type: "page", page: 18, key: "page-4" },
                { type: "page", page: 19, key: "page-5" },
                { type: "page", page: 20, key: "page-6" },
            ])
        })
    })

    describe("with a wider sibling window", () => {
        it("lists every page without ellipsis when they fit", () => {
            expect(getPaginationRange(5, 9, { siblingCount: 2 })).toStrictEqual([
                { type: "page", page: 1, key: "page-0" },
                { type: "page", page: 2, key: "page-1" },
                { type: "page", page: 3, key: "page-2" },
                { type: "page", page: 4, key: "page-3" },
                { type: "page", page: 5, key: "page-4" },
                { type: "page", page: 6, key: "page-5" },
                { type: "page", page: 7, key: "page-6" },
                { type: "page", page: 8, key: "page-7" },
                { type: "page", page: 9, key: "page-8" },
            ])
        })

        it("keeps two siblings on each side of the current page", () => {
            expect(getPaginationRange(10, 20, { siblingCount: 2 })).toStrictEqual([
                { type: "page", page: 1, key: "page-0" },
                { type: "ellipsis", key: "ellipsis-start-1" },
                { type: "page", page: 8, key: "page-2" },
                { type: "page", page: 9, key: "page-3" },
                { type: "page", page: 10, key: "page-4" },
                { type: "page", page: 11, key: "page-5" },
                { type: "page", page: 12, key: "page-6" },
                { type: "ellipsis", key: "ellipsis-end-7" },
                { type: "page", page: 20, key: "page-8" },
            ])
        })
    })

    describe("clamps weird sibling counts to a single sibling", () => {
        it.each([
            { siblingCount: 0 },
            { siblingCount: -3 },
            { siblingCount: Number.NaN },
            { siblingCount: Infinity },
            { siblingCount: -Infinity },
            { siblingCount: 0.5 },
        ])("treats $siblingCount like 1", ({ siblingCount }) => {
            expect(getPaginationRange(10, 20, { siblingCount })).toStrictEqual(
                getPaginationRange(10, 20, { siblingCount: 1 }),
            )
        })

        it("floors fractional values to the nearest integer", () => {
            expect(getPaginationRange(10, 20, { siblingCount: 2.9 })).toStrictEqual(
                getPaginationRange(10, 20, { siblingCount: 2 }),
            )
        })
    })

    it("keys page entries by their slot, not their page number", () => {
        const entries = getPaginationRange(10, 20, { siblingCount: 1 })
        const pages = entries.filter(entry => entry.type === "page")

        expect(pages.map(entry => entry.key)).toStrictEqual([
            "page-0",
            "page-2",
            "page-3",
            "page-4",
            "page-6",
        ])
    })
})
