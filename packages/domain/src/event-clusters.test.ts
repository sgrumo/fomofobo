import { describe, expect, it } from "vitest"

import {
    buildEventClusters,
    clusterArcs,
    clusterLayer,
    firstLeafIndex,
    markerEmphasis,
    markerLayer,
    venueSpots,
} from "./event-clusters"
import type { MapPointKind } from "./event-clusters"

describe("buildEventClusters", () => {
    const venue = { latitude: 44.3533, longitude: 11.7147 }
    const nextDoor = { latitude: 44.3534, longitude: 11.7148 }
    const farAway = { latitude: 44.5, longitude: 11.9 }
    const world: [number, number, number, number] = [-180, -85, 180, 85]

    it("merges close spots into one cluster that counts its spots per kind", () => {
        const index = buildEventClusters([
            {
                venueId: "venue-0",
                coordinates: venue,
                kind: "live",
                index: 0,
                moreCount: 0,
            },
            {
                venueId: "venue-1",
                coordinates: nextDoor,
                kind: "upcoming",
                index: 1,
                moreCount: 2,
            },
            {
                venueId: "venue-2",
                coordinates: venue,
                kind: "live",
                index: 2,
                moreCount: 0,
            },
            {
                venueId: "venue-3",
                coordinates: nextDoor,
                kind: "ended",
                index: 3,
                moreCount: 0,
            },
            {
                venueId: "venue-4",
                coordinates: farAway,
                kind: "live",
                index: 4,
                moreCount: 1,
            },
            {
                venueId: "venue-5",
                coordinates: venue,
                kind: "permanent",
                index: 5,
                moreCount: 0,
            },
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
                { index: 4, kind: "live", moreCount: 1 },
            ]),
        )
    })

    it("keeps the result index and the count of other results of each single spot", () => {
        const index = buildEventClusters([
            {
                venueId: "venue-0",
                coordinates: venue,
                kind: "ended",
                index: 0,
                moreCount: 3,
            },
            {
                venueId: "venue-1",
                coordinates: farAway,
                kind: "permanent",
                index: 1,
                moreCount: 0,
            },
        ])

        const properties = index.getClusters(world, 17).map(feature => feature.properties)

        expect(properties).toHaveLength(2)
        expect(properties).toStrictEqual(
            expect.arrayContaining([
                { index: 0, kind: "ended", moreCount: 3 },
                { index: 1, kind: "permanent", moreCount: 0 },
            ]),
        )
    })
})

describe("venueSpots", () => {
    const venue = { latitude: 44.3533, longitude: 11.7147 }
    const farAway = { latitude: 44.5, longitude: 11.9 }

    it("marks each venue with its result of the highest layer and counts the others", () => {
        expect(
            venueSpots([
                { venueId: "chiostro", coordinates: venue, kind: "upcoming" },
                { venueId: "rocca", coordinates: farAway, kind: "ended" },
                { venueId: "chiostro", coordinates: venue, kind: "live" },
                { venueId: "chiostro", coordinates: venue, kind: "permanent" },
            ]),
        ).toStrictEqual([
            {
                venueId: "chiostro",
                coordinates: venue,
                kind: "live",
                index: 2,
                moreCount: 2,
            },
            {
                venueId: "rocca",
                coordinates: farAway,
                kind: "ended",
                index: 1,
                moreCount: 0,
            },
        ])
    })

    it("marks a venue with its first result among results of one kind", () => {
        expect(
            venueSpots([
                { venueId: "chiostro", coordinates: venue, kind: "upcoming" },
                { venueId: "chiostro", coordinates: venue, kind: "upcoming" },
            ]),
        ).toStrictEqual([
            {
                venueId: "chiostro",
                coordinates: venue,
                kind: "upcoming",
                index: 0,
                moreCount: 1,
            },
        ])
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

describe("markerEmphasis", () => {
    const venue = { latitude: 44.3533, longitude: 11.7147 }
    const nextDoor = { latitude: 44.3534, longitude: 11.7148 }
    const farAway = { latitude: 44.5, longitude: 11.9 }
    const world: [number, number, number, number] = [-180, -85, 180, 85]
    const clusters = buildEventClusters([
        { venueId: "chiostro", coordinates: venue, kind: "live", index: 0, moreCount: 0 },
        {
            venueId: "rocca",
            coordinates: nextDoor,
            kind: "ended",
            index: 1,
            moreCount: 0,
        },
        {
            venueId: "teatro",
            coordinates: farAway,
            kind: "upcoming",
            index: 2,
            moreCount: 0,
        },
    ])
    const features = clusters
        .getClusters(world, 12)
        .toSorted(
            (first, second) =>
                Number("cluster" in second.properties) -
                Number("cluster" in first.properties),
        )

    it("leaves every marker as it is with no selection", () => {
        expect(
            features.map(feature => markerEmphasis(feature, clusters, undefined)),
        ).toStrictEqual(["normal", "normal"])
    })

    it("keeps the cluster that holds the selected spot and dims the other spot", () => {
        expect(
            features.map(feature => markerEmphasis(feature, clusters, 1)),
        ).toStrictEqual(["normal", "dimmed"])
    })

    it("marks the selected spot and dims the cluster that does not hold it", () => {
        expect(
            features.map(feature => markerEmphasis(feature, clusters, 2)),
        ).toStrictEqual(["dimmed", "selected"])
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

describe("clusterArcs", () => {
    it("draws one arc per kind from live to permanent, sized by its share, over the whole ring", () => {
        expect(
            clusterArcs({
                liveCount: 1,
                upcomingCount: 2,
                endedCount: 0,
                permanentCount: 1,
            }),
        ).toStrictEqual([
            { kind: "live", from: 0, to: 25 },
            { kind: "upcoming", from: 25, to: 75 },
            { kind: "ended", from: 75, to: 75 },
            { kind: "permanent", from: 75, to: 100 },
        ])
    })
})
