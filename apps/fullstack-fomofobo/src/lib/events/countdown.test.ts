import { describe, expect, it } from "vitest"

import { countdownParts } from "./countdown"

describe("countdownParts", () => {
    it.each([
        { spanMs: 72 * 60_000, expected: { hours: 1, minutes: 12 } },
        { spanMs: 71 * 60_000 + 1, expected: { hours: 1, minutes: 12 } },
        { spanMs: 30_000, expected: { hours: 0, minutes: 1 } },
        { spanMs: 0, expected: { hours: 0, minutes: 0 } },
        { spanMs: -5000, expected: { hours: 0, minutes: 0 } },
    ])("splits $spanMs ms", ({ spanMs, expected }) => {
        expect(countdownParts(spanMs)).toStrictEqual(expected)
    })
})
