import { describe, expect, it } from "vitest"

import { buildEventClusters } from "./event-clusters"

describe("buildEventClusters", () => {
    const venue = { latitude: 44.3533, longitude: 11.7147 }
    const nextDoor = { latitude: 44.3534, longitude: 11.7148 }
    const farAway = { latitude: 44.5, longitude: 11.9 }
    const world: [number, number, number, number] = [-180, -85, 180, 85]

    it("merges close points into one cluster that counts its points per status", () => {
        const index = buildEventClusters([
            { coordinates: venue, status: "live" },
            { coordinates: nextDoor, status: "upcoming" },
            { coordinates: venue, status: "live" },
            { coordinates: nextDoor, status: "ended" },
            { coordinates: farAway, status: "live" },
        ])

        const properties = index.getClusters(world, 12).map(feature => feature.properties)

        expect(properties).toHaveLength(2)
        expect(properties).toStrictEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    cluster: true,
                    point_count: 4,
                    liveCount: 2,
                    upcomingCount: 1,
                    endedCount: 1,
                }),
                { index: 4, status: "live" },
            ]),
        )
    })

    it("keeps the result index of each single point", () => {
        const index = buildEventClusters([
            { coordinates: venue, status: "ended" },
            { coordinates: farAway, status: "live" },
        ])

        const properties = index.getClusters(world, 17).map(feature => feature.properties)

        expect(properties).toHaveLength(2)
        expect(properties).toStrictEqual(
            expect.arrayContaining([
                { index: 0, status: "ended" },
                { index: 1, status: "live" },
            ]),
        )
    })
})
