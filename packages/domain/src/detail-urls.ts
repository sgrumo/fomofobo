import type { OccurrenceRef } from "models"
import { z } from "zod"

import { mapQuerySchema } from "./map-query"
import type { MapQuery } from "./map-query"

/**
 * @description Builds the URL of the web map with a query
 * @param baseUrl Origin of the web app
 * @param language Language segment of the path
 * @param query Keys of the map query
 */
const mapUrlOf = (baseUrl: string, language: string, query: MapQuery): string => {
    const url = new URL(`/${language}`, baseUrl)
    url.search = new URLSearchParams(z.encode(mapQuerySchema, query)).toString()
    return url.href
}

/**
 * @description Builds the URL of the web map with the detail of an occurrence open, which every
 * shared link opens
 * @param baseUrl Origin of the web app
 * @param language Language segment of the path
 * @param occurrence Event and date of the occurrence
 */
export const eventDetailUrlOf = (
    baseUrl: string,
    language: string,
    occurrence: OccurrenceRef,
): string =>
    mapUrlOf(baseUrl, language, {
        event: occurrence.eventId,
        occurrence: occurrence.date,
        detail: true,
    })

/**
 * @description Builds the URL of the web map with the detail of a venue open, which every shared
 * link opens
 * @param baseUrl Origin of the web app
 * @param language Language segment of the path
 * @param venueId Id of the venue
 */
export const venueDetailUrlOf = (
    baseUrl: string,
    language: string,
    venueId: string,
): string => mapUrlOf(baseUrl, language, { venue: venueId, detail: true })
