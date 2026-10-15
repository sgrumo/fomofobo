import { describe, expect, it } from "vitest"

import { cacheKey, specifier } from "./cache-keys"

describe("cacheKey", () => {
    it("should only contain key/value pairs where key = value", () => {
        for (const [key, value] of Object.entries(cacheKey)) {
            expect(key).toStrictEqual(value)
        }
    })
})

describe("specifier", () => {
    it("should only contain key/value pairs where key = value", () => {
        for (const [key, value] of Object.entries(specifier)) {
            expect(key).toStrictEqual(value)
        }
    })
})
