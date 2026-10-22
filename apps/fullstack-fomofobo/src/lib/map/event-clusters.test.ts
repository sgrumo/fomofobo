import { describe, expect, it } from "vitest"

import {
    buildEventClusters,
    clusterLayer,
    firstLeafIndex,
    markerLayer,
} from "./event-clusters"
import type { MapPointKind } from "./event-clusters"

describe("buildEventClusters", () => {
    const venue = { latitude: 44.3533, longitude: 11.7147 }
    const nextDoor = { latitude: 44.3534, longitude: 11.7148 }
    const farAway = { latitude: 44.5, longitude: 11.9 }
    const world: [number, number, number, number] = [-180, -85, 180, 85]

    it("merges close points into one cluster that counts its points per kind", () => {
        const index = buildEventClusters([
            { coordinates: venue, kind: "live" },
            { coordinates: nextDoor, kind: "upcoming" },
            { coordinates: venue, kind: "live" },
            { coordinates: nextDoor, kind: "ended" },
            { coordinates: farAway, kind: "live" },
            { coordinates: venue, kind: "permanent" },
        ])

        const properties = index.getClusters(world, 12).map(feature => feature.properties)

        expect(properties).toHaveLength(2)
        expect(properties).toStrictEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    cluster: true,
                    point_count: 5,
                    liveCount: 2,
                    upcomingCount: 1,
                    endedCount: 1,
                    permanentCount: 1,
                }),
                { index: 4, kind: "live" },
            ]),
        )
    })

    it("keeps the result index of each single point", () => {
        const index = buildEventClusters([
            { coordinates: venue, kind: "ended" },
            { coordinates: farAway, kind: "permanent" },
        ])

        const properties = index.getClusters(world, 17).map(feature => feature.properties)

        expect(properties).toHaveLength(2)
        expect(properties).toStrictEqual(
            expect.arrayContaining([
                { index: 0, kind: "ended" },
                { index: 1, kind: "permanent" },
            ]),
        )
    })
})

describe("firstLeafIndex", () => {
    it("returns the lowest result index of the leaves", () => {
        expect(
            firstLeafIndex([
                { properties: { index: 3 } },
                { properties: { index: 1 } },
                { properties: { index: 2 } },
            ]),
        ).toBe(1)
    })
})

describe("markerLayer and clusterLayer", () => {
    it("stacks live above upcoming, upcoming above ended, ended above permanent", () => {
        const bottomToTop: MapPointKind[] = ["permanent", "ended", "upcoming", "live"]

        expect(bottomToTop.map(markerLayer)).toStrictEqual([0, 1, 2, 3])
    })

    it("stacks a cluster at the layer of the highest kind it holds", () => {
        const empty = { liveCount: 0, upcomingCount: 0, endedCount: 0, permanentCount: 0 }

        expect([
            clusterLayer({ ...empty, permanentCount: 3, liveCount: 1 }),
            clusterLayer({ ...empty, permanentCount: 2, endedCount: 1 }),
            clusterLayer({ ...empty, permanentCount: 2 }),
        ]).toStrictEqual([
            markerLayer("live"),
            markerLayer("ended"),
            markerLayer("permanent"),
        ])
    })
})
