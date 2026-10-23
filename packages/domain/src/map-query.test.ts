import { describe, expect, it } from "vitest"
import { z } from "zod"

import { mapQuerySchema } from "./map-query"

describe("mapQuerySchema", () => {
    it("decodes the query of a web map URL", () => {
        const query = mapQuerySchema.parse({
            lat: "44.353",
            lng: "11.715",
            free: "true",
            date: "today",
            event: "c3d4e5f6-a7b8-4c9d-8e0f-1a2b3c4d5e01",
            occurrence: "2026-10-23",
        })

        expect(query).toStrictEqual({
            lat: 44.353,
            lng: 11.715,
            free: true,
            date: "today",
            event: "c3d4e5f6-a7b8-4c9d-8e0f-1a2b3c4d5e01",
            occurrence: "2026-10-23",
        })
    })

    it("decodes a malformed value to undefined", () => {
        const query = mapQuerySchema.parse({ lat: "north", lng: "200", venue: "42" })

        expect(query).toStrictEqual({ lat: undefined, lng: undefined, venue: undefined })
    })

    it("encodes back to the strings it decodes", () => {
        const encoded = z.encode(mapQuerySchema, { lat: 44.353, lng: 11.715, free: true })

        expect(encoded).toStrictEqual({ lat: "44.353", lng: "11.715", free: "true" })
    })
})
