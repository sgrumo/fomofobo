// The suite runs in node and reads the web stylesheet, the source of the shapes
// oxlint-disable-next-line import/no-nodejs-modules
import { readFileSync } from "node:fs"

import {
    PIXEL_CIRCLE_PROFILES,
    PIXEL_CIRCLE_SIZES,
    PIXEL_CORNER_PROFILE,
} from "domain/pixel-shapes"
import { describe, expect, it } from "vitest"

import {
    dashWedgesPath,
    innerProfile,
    PIXEL_RING_WIDTH,
    steppedPath,
    steppedPolygon,
    wedgePath,
} from "./pixel-shapes"

const globalsCss = readFileSync(
    new URL("../../../../../packages/styles/src/globals.css", import.meta.url),
    "utf8",
)

/**
 * @description Returns the vertices of a `--<name>: polygon(...)` of the web stylesheet, sorted
 * @param name Custom property name without dashes
 * @param width Value of `100%` on the x axis
 * @param height Value of `100%` on the y axis
 */
const cssPolygon = (name: string, width: number, height: number) => {
    const body = new RegExp(`--${name}: polygon\\((?<points>[^;]+?)\\);`, "su").exec(
        globalsCss,
    )?.groups?.points
    const coordinate = (value: string, full: number) => {
        const fromEnd = /^calc\(100% - (?<px>\d+)px\)$/u.exec(value)?.groups?.px
        return value === "100%"
            ? full
            : fromEnd === undefined
              ? Number(value.replace("px", ""))
              : full - Number(fromEnd)
    }
    return (body ?? "")
        .split(",")
        .map(point => /^(?<x>calc\([^)]*\)|\S+)\s+(?<y>.+)$/u.exec(point.trim())?.groups)
        .map(point => [
            coordinate(point?.x ?? "", width),
            coordinate(point?.y ?? "", height),
        ])
        .toSorted(([x1 = 0, y1 = 0], [x2 = 0, y2 = 0]) => x1 - x2 || y1 - y2)
}

const sorted = (points: ReadonlyArray<readonly [number, number]>, offset = 0) =>
    points
        .map(([x, y]) => [x + offset, y + offset])
        .toSorted(([x1 = 0, y1 = 0], [x2 = 0, y2 = 0]) => x1 - x2 || y1 - y2)

describe("pixel shapes", () => {
    it("match the outer pixel corners of the web on any box", () => {
        expect(sorted(steppedPolygon(100, 60, PIXEL_CORNER_PROFILE))).toStrictEqual(
            cssPolygon("pixel-corners-outer", 100, 60),
        )
    })

    it("match the inner pixel corners of the web inside the 2 pt ring", () => {
        expect(
            sorted(steppedPolygon(96, 56, innerProfile(PIXEL_CORNER_PROFILE))),
        ).toStrictEqual(cssPolygon("pixel-corners-inner", 96, 56))
    })

    it.each(PIXEL_CIRCLE_SIZES)("match the outer pixel circle %i of the web", size => {
        expect(
            sorted(steppedPolygon(size, size, PIXEL_CIRCLE_PROFILES[size])),
        ).toStrictEqual(cssPolygon(`pixel-circle-outer-${String(size)}`, size, size))
    })

    it.each(PIXEL_CIRCLE_SIZES)("match the inner pixel circle %i of the web", size => {
        const inner = size - 2 * PIXEL_RING_WIDTH
        expect(
            sorted(
                steppedPolygon(inner, inner, innerProfile(PIXEL_CIRCLE_PROFILES[size])),
                PIXEL_RING_WIDTH,
            ),
        ).toStrictEqual(cssPolygon(`pixel-circle-inner-${String(size)}`, size, size))
    })

    it("builds a closed path moved by the offset", () => {
        expect(steppedPath(10, 10, [1], 3)).toBe(
            "M3 4 L4 4 L4 3 L12 3 L12 4 L13 4 L13 12 L12 12 L12 13 L4 13 L4 12 L3 12 Z",
        )
    })

    it("draw twelve dash wedges, the first from 12 o'clock to 15 degrees clockwise", () => {
        const path = dashWedgesPath(36, 36)

        expect(path.split("M")).toHaveLength(13)
        expect(path).toMatch(/^M18 18 L18 -54 L36\.6\d* -51\.5\d* Z/u)
    })

    it("draw a full-turn wedge as a fan of 15 degree steps that closes at 12 o'clock", () => {
        const path = wedgePath(48, 48, 0, 360)

        expect(path.split(" L")).toHaveLength(26)
        expect(path).toMatch(/^M24 24 L24 -72 L/u)
        expect(path).toMatch(/ L23\.99\d* -72 Z$/u)
    })
})
