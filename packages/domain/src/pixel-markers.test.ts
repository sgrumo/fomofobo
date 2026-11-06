import { describe, expect, it } from "vitest"

import {
    CLUSTER_SHAPE,
    EVENT_DISC,
    LIVE_WAVE,
    MARKER_CELL_PX,
    POSITION_CORE,
    POSITION_WAVE,
    SELECTED_EVENT_DISC,
} from "./pixel-markers"

/**
 * @description Returns the cells a path fills, as `x y` keys
 * @param path SVG path data of one rectangle per horizontal run
 */
const cellsOf = (path: string): Set<string> =>
    new Set(
        [...path.matchAll(/M(?<x>\d+) (?<y>\d+)h(?<run>\d+)/gu)].flatMap(match =>
            Array.from(
                { length: Number(match.groups?.run) },
                (_, index) =>
                    `${String(Number(match.groups?.x) + index)} ${String(match.groups?.y)}`,
            ),
        ),
    )

describe("pixel markers", () => {
    it("sizes each marker as the reference, in px", () => {
        expect(
            [
                EVENT_DISC.cells,
                SELECTED_EVENT_DISC.cells,
                LIVE_WAVE.cells,
                POSITION_CORE.cells,
                POSITION_WAVE.cells,
                CLUSTER_SHAPE.cells,
            ].map(cells => cells * MARKER_CELL_PX),
        ).toStrictEqual([44, 52, 104, 28, 68, 60])
    })

    it("mirrors the disc across both axes", () => {
        const cells = cellsOf(EVENT_DISC.ringPath)
        const last = EVENT_DISC.cells - 1
        const mirrored = new Set(
            [...cells].map(key => {
                const [x = 0, y = 0] = key.split(" ").map(Number)
                return `${String(last - x)} ${String(last - y)}`
            }),
        )

        expect(mirrored).toStrictEqual(cells)
    })

    it("keeps the fill inside the ring, with no shared cell", () => {
        const fill = cellsOf(EVENT_DISC.fillPath)
        const ring = cellsOf(EVENT_DISC.ringPath)

        expect([...fill].filter(key => ring.has(key))).toStrictEqual([])
        expect(fill.size).toBeGreaterThan(ring.size)
    })

    it("lays the frames of each sprite side by side, the first one drawn", () => {
        const sprites = [LIVE_WAVE, POSITION_WAVE]

        expect(sprites.map(sprite => [sprite.frames, sprite.cycleMs])).toStrictEqual([
            [24, 1600],
            [37, 2470],
        ])
        for (const sprite of sprites) {
            const columns = [...cellsOf(sprite.path)].map(key =>
                Number(key.split(" ")[0]),
            )
            expect(Math.max(...columns)).toBeLessThan(sprite.cells * sprite.frames)
            expect(Math.min(...columns)).toBeLessThan(sprite.cells)
        }
    })

    it("starts the live wave one cell clear of the disc ring", () => {
        const center = LIVE_WAVE.cells / 2
        const distances = [...cellsOf(LIVE_WAVE.path)]
            .map(key => key.split(" ").map(Number))
            .filter(([x = 0]) => x < LIVE_WAVE.cells)
            .map(([x = 0, y = 0]) => Math.hypot(x + 0.5 - center, y + 0.5 - center))

        expect(Math.min(...distances)).toBeGreaterThan(10)
        expect(Math.max(...distances)).toBeLessThanOrEqual(11)
    })

    it("keeps the still grid of the position wave out of its frames", () => {
        const still = cellsOf(POSITION_WAVE.stillPath)
        const framed = [...cellsOf(POSITION_WAVE.path)].map(key => {
            const [x = 0, y = 0] = key.split(" ").map(Number)
            return `${String(x % POSITION_WAVE.cells)} ${String(y)}`
        })

        expect(still.size).toBeGreaterThan(0)
        expect(framed.filter(key => still.has(key))).toStrictEqual([])
    })
})
