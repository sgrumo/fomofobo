import type { OccurrenceSummary, PublicVenue } from "models"

import { localTimeOf, weekdayDateOf } from "./local-format"
import { PLATFORM_TIME_ZONE } from "./platform"

/**
 * @description Returns the weekday and date, the start time and the venue of an occurrence,
 * in the platform zone
 * @param occurrence Occurrence summarized
 * @param language BCP 47 language of the weekday
 */
export const shareSummaryOf = (
    occurrence: Pick<OccurrenceSummary, "startsAt" | "venue">,
    language: string,
): string => {
    const startsAt = new Date(occurrence.startsAt)
    return [
        weekdayDateOf(startsAt, PLATFORM_TIME_ZONE, language),
        localTimeOf(startsAt, PLATFORM_TIME_ZONE),
        occurrence.venue.name,
    ].join(" · ")
}

/**
 * @description Returns the share text of a venue: its name and its address
 * @param venue Venue shared
 */
export const venueShareTextOf = (venue: Pick<PublicVenue, "name" | "address">): string =>
    `${venue.name} · ${venue.address}`
