import { existsSync, readFileSync } from "node:fs"
import { createRequire } from "node:module"
import path from "node:path"

import { validateStyleMin } from "@maplibre/maplibre-gl-style-spec"
import { describe, expect, it } from "vitest"

import { mapStyle } from "./map-style"

describe("map style", () => {
    it("passes the MapLibre style validation", () => {
        expect(validateStyleMin(mapStyle)).toStrictEqual([])
    })

    it("paints with the map palette of packages/styles only", () => {
        const globalsCss = readFileSync(
            createRequire(import.meta.url).resolve("styles"),
            "utf8",
        )
        const mapPalette = new Set<unknown>(
            [
                ...globalsCss.matchAll(
                    /--palette-map-[a-z-]+:\s*(?<color>#[\da-f]{6});/gu,
                ),
            ].map(match => match.groups?.color),
        )
        const paintColors = mapStyle.layers
            .flatMap(layer => Object.entries<unknown>(layer.paint))
            .filter(([property]) => property.endsWith("-color"))
            .map(([, value]) => value)

        expect(paintColors.length).toBeGreaterThan(0)
        expect(paintColors.filter(color => !mapPalette.has(color))).toStrictEqual([])
    })

    it("ships every pattern image it names", () => {
        const patternFiles = Object.values(mapStyle.metadata["fomofobo:patterns"])

        expect(
            patternFiles.filter(
                file =>
                    !existsSync(path.join(import.meta.dirname, "../../../public", file)),
            ),
        ).toStrictEqual([])
    })
})
