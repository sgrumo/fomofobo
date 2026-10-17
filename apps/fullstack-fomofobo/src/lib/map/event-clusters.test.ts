import { describe, expect, it } from "vitest"

import { buildEventClusters } from "./event-clusters"

describe("buildEventClusters", () => {
    const venue = { latitude: 44.3533, longitude: 11.7147 }
    const nextDoor = { latitude: 44.3534, longitude: 11.7148 }
    const farAway = { latitude: 44.5, longitude: 11.9 }
    const world: [number, number, number, number] = [-180, -85, 180, 85]

    it("merges close points into one cluster that counts its live points", () => {
        const index = buildEventClusters([
            { coordinates: venue, live: true },
            { coordinates: nextDoor, live: false },
            { coordinates: venue, live: true },
            { coordinates: farAway, live: true },
        ])

        const properties = index.getClusters(world, 12).map(feature => feature.properties)

        expect(properties).toHaveLength(2)
        expect(properties).toStrictEqual(
            expect.arrayContaining([
                expect.objectContaining({ cluster: true, point_count: 3, liveCount: 2 }),
                { index: 3, live: true },
            ]),
        )
    })

    it("keeps the result index of each single point", () => {
        const index = buildEventClusters([
            { coordinates: venue, live: false },
            { coordinates: farAway, live: true },
        ])

        const properties = index.getClusters(world, 17).map(feature => feature.properties)

        expect(properties).toHaveLength(2)
        expect(properties).toStrictEqual(
            expect.arrayContaining([
                { index: 0, live: false },
                { index: 1, live: true },
            ]),
        )
    })
})
