import type { OccurrenceSummary } from "models"

import { localDateOf } from "./date-window"
import { occurrenceStatus } from "./occurrence-status"

export interface StatusBarCounts {
    live: number
    upcomingToday: number
}

/**
 * @description Returns the count of live occurrences and of upcoming ones that start today
 * @param occurrences Occurrences of the search
 * @param now Instant the statuses hold at
 * @param timeZone IANA zone that sets today
 */
export const statusBarCounts = (
    occurrences: ReadonlyArray<Pick<OccurrenceSummary, "startsAt" | "endsAt">>,
    now: Date,
    timeZone: string,
): StatusBarCounts => {
    const today = localDateOf(now, timeZone)

    return occurrences.reduce<StatusBarCounts>(
        (counts, occurrence) => {
            const startsAt = new Date(occurrence.startsAt)
            const status = occurrenceStatus(
                { startsAt, endsAt: new Date(occurrence.endsAt) },
                now,
            )
            const upcomingToday =
                status === "upcoming" && localDateOf(startsAt, timeZone) === today

            return {
                live: counts.live + (status === "live" ? 1 : 0),
                upcomingToday: counts.upcomingToday + (upcomingToday ? 1 : 0),
            }
        },
        { live: 0, upcomingToday: 0 },
    )
}
