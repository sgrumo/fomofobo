import type { OccurrenceRef } from "models"

/**
 * @description Builds the URL of the public web page of an occurrence, which every shared link
 * opens
 * @param baseUrl Origin of the web app
 * @param language Language segment of the path
 * @param occurrence Event and date of the occurrence
 */
export const eventPageUrlOf = (
    baseUrl: string,
    language: string,
    occurrence: OccurrenceRef,
): string =>
    new URL(`/${language}/events/${occurrence.eventId}/${occurrence.date}`, baseUrl).href

/**
 * @description Builds the URL of the public web page of a venue, which every shared link opens
 * @param baseUrl Origin of the web app
 * @param language Language segment of the path
 * @param venueId Id of the venue
 */
export const venuePageUrlOf = (
    baseUrl: string,
    language: string,
    venueId: string,
): string => new URL(`/${language}/venues/${venueId}`, baseUrl).href
