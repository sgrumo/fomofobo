import { describe, expect, it } from "vitest"

import { buildEventClusters, shownFeaturesOf } from "./event-clusters"
import {
    enterMoveOf,
    isSameMarkerSet,
    leaveMoveOf,
    markerTransitions,
    movedBoundsOf,
    pixelOffset,
    leavingEmphasisOf,
    resultIdOf,
    resultTransitions,
    sceneTransitionsOf,
    shownMarkersOf,
} from "./marker-motion"
import type { ShownMarker } from "./marker-motion"

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
        shownMarkersOf(clusters.getClusters(world, zoom), clusters, String)
    const far = markersAt(10)
    const near = markersAt(15)

    it("keys a marker by the ids of the results it holds", () => {
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

describe("resultTransitions", () => {
    const marker = (key: string): ShownMarker => ({
        key,
        coordinates: { latitude: 44.3533, longitude: 11.7147 },
        leaves: [0],
        feature: {
            type: "Feature",
            geometry: { type: "Point", coordinates: [11.7147, 44.3533] },
            properties: { index: 0, kind: "live", moreCount: 0 },
        },
    })

    it("fades the new markers in and the gone ones out in place, and leaves the kept ones", () => {
        const kept = marker("kept")
        const gone = marker("gone")
        const added = marker("added")

        expect(resultTransitions([kept, gone], [kept, added])).toStrictEqual({
            entering: new Map([["added", undefined]]),
            leaving: [{ marker: gone, target: undefined }],
        })
    })
})

describe("sceneTransitionsOf", () => {
    const world: [number, number, number, number] = [-180, -85, 180, 85]
    const clusters = buildEventClusters(
        [0, 1].map(index => ({
            venueIds: [`venue-${String(index)}`],
            coordinates: { latitude: 44.3533, longitude: 11.7147 + index * 0.0005 },
            kind: "live",
            index,
            moreCount: 0,
        })),
    )
    const markers = shownMarkersOf(
        shownFeaturesOf(clusters, world, 12, undefined),
        clusters,
        String,
    )
    const opened = shownMarkersOf(
        shownFeaturesOf(clusters, world, 12, 0),
        clusters,
        String,
    )
    const renamed = shownMarkersOf(
        shownFeaturesOf(clusters, world, 12, undefined),
        clusters,
        () => "other",
    )
    const unselected = { clusterZoom: 12, selectedIndex: undefined }

    it("moves nothing on the first scene, or on a pan of the same results", () => {
        expect(sceneTransitionsOf(undefined, true, unselected, markers)).toStrictEqual({
            entering: new Map(),
            leaving: [],
        })
        expect(
            sceneTransitionsOf({ markers, ...unselected }, true, unselected, markers),
        ).toStrictEqual({ entering: new Map(), leaving: [] })
    })

    it("fades the markers of new results", () => {
        expect(
            sceneTransitionsOf({ markers, ...unselected }, false, unselected, renamed),
        ).toStrictEqual(resultTransitions(markers, renamed))
    })

    it("moves the spots out of the cluster that a new selection opens, at the same zoom", () => {
        expect(
            sceneTransitionsOf(
                { markers, ...unselected },
                true,
                { clusterZoom: 12, selectedIndex: 0 },
                opened,
            ),
        ).toStrictEqual(markerTransitions(markers, opened))
        expect(markerTransitions(markers, opened).entering.size).toBe(2)
    })
})

describe("leavingEmphasisOf", () => {
    it("fades a leaving marker out dimmed while a spot was selected", () => {
        expect([leavingEmphasisOf(true), leavingEmphasisOf(false)]).toStrictEqual([
            "dimmed",
            "normal",
        ])
    })
})

describe("resultIdOf", () => {
    const results = {
        occurrences: [{ eventId: "concert", date: "2026-10-24" }],
        permanentVenues: [{ id: "cinema" }],
    }

    it("names an occurrence by its event and date, and a permanent venue after them", () => {
        expect(resultIdOf(results, 0)).toBe("concert:2026-10-24")
        expect(resultIdOf(results, 1)).toBe("venue:cinema")
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

describe("movedBoundsOf", () => {
    const bounds: [number, number, number, number] = [11.3, 44.45, 11.4, 44.55]

    it("keeps the bounds of a move that keeps the center and the zoom", () => {
        const [west, south, east, north] = movedBoundsOf(
            bounds,
            12,
            { latitude: 44.5, longitude: 11.35 },
            12,
        )

        expect(west).toBeCloseTo(11.3)
        expect(south).toBeCloseTo(44.45)
        expect(east).toBeCloseTo(11.4)
        expect(north).toBeCloseTo(44.55)
    })

    it("halves the span at each zoom level, around the new center", () => {
        const center = { latitude: 44.48, longitude: 11.33 }
        const [west, south, east, north] = movedBoundsOf(bounds, 12, center, 13)

        expect(east - west).toBeCloseTo(0.05)
        expect((west + east) / 2).toBeCloseTo(center.longitude)
        expect(south).toBeLessThan(center.latitude)
        expect(north).toBeGreaterThan(center.latitude)
        expect(north - south).toBeCloseTo(0.05, 2)
    })
})

describe("isSameMarkerSet", () => {
    const marker = (key: string): ShownMarker => ({
        key,
        coordinates: { latitude: 44.3533, longitude: 11.7147 },
        leaves: [0],
        feature: {
            type: "Feature",
            geometry: { type: "Point", coordinates: [11.7147, 44.3533] },
            properties: { index: 0, kind: "live", moreCount: 0 },
        },
    })

    it("matches the same markers in any order", () => {
        expect(
            isSameMarkerSet([marker("a"), marker("b")], [marker("b"), marker("a")]),
        ).toBe(true)
    })

    it("tells apart a set with a marker more, less or different", () => {
        expect(isSameMarkerSet([marker("a")], [marker("a"), marker("b")])).toBe(false)
        expect(isSameMarkerSet([marker("a"), marker("b")], [marker("a")])).toBe(false)
        expect(isSameMarkerSet([marker("a")], [marker("b")])).toBe(false)
    })
})
