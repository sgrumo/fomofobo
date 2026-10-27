import { describe, expect, it } from "vitest"

import { buildEventClusters } from "./event-clusters"
import {
    enterMoveOf,
    leaveMoveOf,
    markerTransitions,
    pixelOffset,
    shownMarkersOf,
} from "./marker-motion"

describe("markerTransitions", () => {
    const world: [number, number, number, number] = [-180, -85, 180, 85]
    const venue = { latitude: 44.3533, longitude: 11.7147 }
    const nextDoor = { latitude: 44.3536, longitude: 11.715 }
    const farther = { latitude: 44.36, longitude: 11.72 }
    const clusters = buildEventClusters([
        {
            venueIds: ["piazza"],
            coordinates: venue,
            kind: "live",
            index: 0,
            moreCount: 0,
        },
        {
            venueIds: ["chiostro"],
            coordinates: nextDoor,
            kind: "upcoming",
            index: 1,
            moreCount: 0,
        },
        {
            venueIds: ["rocca"],
            coordinates: farther,
            kind: "ended",
            index: 2,
            moreCount: 0,
        },
    ])
    const markersAt = (zoom: number) =>
        shownMarkersOf(clusters.getClusters(world, zoom), clusters)
    const far = markersAt(10)
    const near = markersAt(15)

    it("keys a marker by the result indexes it holds", () => {
        expect(far.map(marker => marker.key)).toStrictEqual(["0 1 2"])
        expect(near.map(marker => marker.key).toSorted()).toStrictEqual(["0 1", "2"])
    })

    it("starts each marker split from a cluster at that cluster, and lets the cluster go", () => {
        const transitions = markerTransitions(far, near)

        expect([...transitions.entering.values()]).toStrictEqual([
            far[0]?.coordinates,
            far[0]?.coordinates,
        ])
        expect(transitions.leaving).toStrictEqual([{ marker: far[0], target: undefined }])
    })

    it("moves each marker merged into a cluster to it, and fades the cluster in", () => {
        const transitions = markerTransitions(near, far)

        expect([...transitions.entering.entries()]).toStrictEqual([["0 1 2", undefined]])
        expect(transitions.leaving.map(leaving => leaving.target)).toStrictEqual([
            far[0]?.coordinates,
            far[0]?.coordinates,
        ])
    })

    it("slides each split marker in from its cluster and fades the cluster out in place", () => {
        const transitions = markerTransitions(far, near)
        const origins = far.map(marker => marker.coordinates)

        expect(near.map(marker => enterMoveOf(marker, transitions, 15))).toStrictEqual(
            near.flatMap(marker =>
                origins.map(origin => ({
                    type: "enter",
                    from: pixelOffset(marker.coordinates, origin, 15),
                })),
            ),
        )
        expect(
            transitions.leaving.map(leaving => leaveMoveOf(leaving, 15)),
        ).toStrictEqual([{ type: "leave", to: undefined }])
    })

    it("moves nothing when the markers stay", () => {
        expect(markerTransitions(near, markersAt(15))).toStrictEqual({
            entering: new Map(),
            leaving: [],
        })
    })
})

describe("pixelOffset", () => {
    it("measures a quarter turn of longitude as a quarter of the world at zoom 0", () => {
        expect(
            pixelOffset({ latitude: 0, longitude: 0 }, { latitude: 0, longitude: 90 }, 0),
        ).toStrictEqual({ x: 128, y: 0 })
    })

    it("doubles the offset at each zoom level and points north up the screen", () => {
        const offset = pixelOffset(
            { latitude: 44.35, longitude: 11.71 },
            { latitude: 44.36, longitude: 11.71 },
            15,
        )

        expect(offset.x).toBe(0)
        expect(offset.y).toBeLessThan(0)
        expect(
            pixelOffset(
                { latitude: 44.35, longitude: 11.71 },
                { latitude: 44.36, longitude: 11.71 },
                16,
            ).y,
        ).toBeCloseTo(2 * offset.y)
    })
})
