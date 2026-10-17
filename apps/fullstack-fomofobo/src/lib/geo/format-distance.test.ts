import { describe, expect, it } from "vitest"

import { formatDistance } from "./format-distance"

describe("formatDistance", () => {
    it.each([
        { meters: 347, language: "it", expected: "350m" },
        { meters: 1234, language: "it", expected: "1,2km" },
        { meters: 1234, language: "en", expected: "1.2km" },
        { meters: 997, language: "en", expected: "1km" },
    ])(
        "formats $meters m in $language as $expected",
        ({ meters, language, expected }) => {
            expect(formatDistance(meters, language)).toBe(expected)
        },
    )
})
