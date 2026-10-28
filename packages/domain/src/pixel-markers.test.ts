import { describe, expect, it } from "vitest"

import {
    CLUSTER_SHAPE,
    EVENT_DISC,
    LIVE_WAVE,
    MARKER_CELL_PX,
    POSITION_CORE,
    POSITION_HALO,
    SELECTED_EVENT_DISC,
    SELECTED_LIVE_WAVE,
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
                SELECTED_LIVE_WAVE.cells,
                POSITION_CORE.cells,
                POSITION_HALO.cells,
                CLUSTER_SHAPE.cells,
            ].map(cells => cells * MARKER_CELL_PX),
        ).toStrictEqual([44, 52, 80, 88, 28, 60, 60])
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

    it("lays the frames of each sprite side by side", () => {
        const sprites = [LIVE_WAVE, SELECTED_LIVE_WAVE, POSITION_HALO]

        expect(sprites.map(sprite => sprite.frames)).toStrictEqual([4, 4, 7])
        for (const sprite of sprites) {
            const columns = [...cellsOf(sprite.path)].map(key =>
                Number(key.split(" ")[0]),
            )
            expect(Math.max(...columns)).toBeLessThan(sprite.cells * sprite.frames)
            expect(Math.max(...columns)).toBeGreaterThanOrEqual(
                sprite.cells * (sprite.frames - 1),
            )
        }
    })
})
