import { describe, expect, it } from "vitest"

import { RADAR_LOADER } from "./radar-loader"

describe("RADAR_LOADER", () => {
    it("runs a cycle of 8 s at 30 ticks a second", () => {
        expect(RADAR_LOADER.tickFrames.length * RADAR_LOADER.tickMs).toBeCloseTo(8000)
    })

    it("shows frames that exist and draw a cell each", () => {
        expect(Math.max(...RADAR_LOADER.tickFrames)).toBeLessThan(
            RADAR_LOADER.framePaths.length,
        )
        expect(RADAR_LOADER.framePaths).not.toContain("")
    })

    it("keeps every cell inside the grid", () => {
        const runs = RADAR_LOADER.framePaths.flatMap(path =>
            [...path.matchAll(/M(?<x>\d+) (?<y>\d+)h(?<run>\d+)/gu)].map(match => ({
                end: Number(match.groups?.x) + Number(match.groups?.run),
                y: Number(match.groups?.y),
            })),
        )

        expect(Math.max(...runs.map(run => run.end))).toBeLessThanOrEqual(
            RADAR_LOADER.cells,
        )
        expect(Math.max(...runs.map(run => run.y))).toBeLessThan(RADAR_LOADER.cells)
    })
})
