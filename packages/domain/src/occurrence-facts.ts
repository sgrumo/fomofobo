import type { OccurrenceDetail, PriceScheme } from "models"
import { isDefined } from "shared/values"

import { localTimeOf, weekdayDateOf } from "./local-format"
import { PLATFORM_TIME_ZONE } from "./platform"

export type OccurrenceFact =
    | { type: "date"; weekdayDate: string }
    | { type: "time"; start: string; end: string }
    | { type: "entry"; priceScheme: PriceScheme }
    | { type: "capacity"; places: number }
    | { type: "interested"; count: number }

/**
 * @description Returns the facts of the event page in order: date, time and entry, then the
 * capacity and the interested count when the occurrence has them, in the platform zone
 * @param occurrence Occurrence described
 * @param language BCP 47 language of the weekday
 */
export const occurrenceFactsOf = (
    occurrence: Pick<
        OccurrenceDetail,
        "startsAt" | "endsAt" | "priceScheme" | "capacity" | "interestedCount"
    >,
    language: string,
): OccurrenceFact[] => {
    const startsAt = new Date(occurrence.startsAt)
    const facts: Array<OccurrenceFact | undefined> = [
        {
            type: "date",
            weekdayDate: weekdayDateOf(startsAt, PLATFORM_TIME_ZONE, language),
        },
        {
            type: "time",
            start: localTimeOf(startsAt, PLATFORM_TIME_ZONE),
            end: localTimeOf(new Date(occurrence.endsAt), PLATFORM_TIME_ZONE),
        },
        { type: "entry", priceScheme: occurrence.priceScheme },
        occurrence.capacity === null
            ? undefined
            : { type: "capacity", places: occurrence.capacity },
        occurrence.interestedCount === null
            ? undefined
            : { type: "interested", count: occurrence.interestedCount },
    ]
    return facts.filter(isDefined)
}
