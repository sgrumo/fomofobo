import { validateStyleMin } from "@maplibre/maplibre-gl-style-spec"
import { describe, expect, it } from "vitest"

import { mapStyle } from "./map-style"

describe("map style", () => {
    it("passes the MapLibre style validation", () => {
        expect(validateStyleMin(mapStyle)).toStrictEqual([])
    })
})
