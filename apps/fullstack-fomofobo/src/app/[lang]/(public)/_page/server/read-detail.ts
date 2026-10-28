import "server-only"
import type { MapQuery } from "domain/map-query"
import { HttpStatus } from "models"
import type { OccurrenceDetail, PublicVenue } from "models"
import { cache } from "react"

import { serverApi } from "@/lib/api/server/api"
import { ApiTransportError } from "@/lib/api/transport-error"

type MapDetail =
    | { type: "occurrence"; occurrence: OccurrenceDetail }
    | { type: "venue"; venue: PublicVenue }

/**
 * @description Returns undefined when a read answers not found, else its value
 * @template T Value of the read
 * @param read Read of a public entity
 * @throws When the read fails another way
 */
const unlessNotFound = async <T>(read: Promise<T>): Promise<T | undefined> => {
    try {
        return await read
    } catch (error) {
        if (error instanceof ApiTransportError && error.status === HttpStatus.NotFound) {
            return undefined
        }
        throw error
    }
}

/**
 * @description Fetches the visible occurrence or venue the map URL selects, once per request
 * @param event Event key of the map query
 * @param occurrence Occurrence key of the map query
 * @param venue Venue key of the map query
 */
export const readDetail = cache(
    async (
        event: MapQuery["event"],
        occurrence: MapQuery["occurrence"],
        venue: MapQuery["venue"],
    ): Promise<MapDetail | undefined> => {
        if (event !== undefined && occurrence !== undefined) {
            const found = await unlessNotFound(
                serverApi.getOccurrence({
                    params: { eventId: event, date: occurrence },
                    query: {},
                }),
            )
            return found === undefined
                ? undefined
                : { type: "occurrence", occurrence: found }
        }
        if (venue !== undefined) {
            const found = await unlessNotFound(
                serverApi.getPublicVenue({ params: { venueId: venue }, query: {} }),
            )
            return found === undefined ? undefined : { type: "venue", venue: found }
        }
        return undefined
    },
)
