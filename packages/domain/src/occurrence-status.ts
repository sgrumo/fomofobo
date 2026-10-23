import type { OccurrenceStatus } from "models"

/**
 * @description Returns the status of an occurrence at an instant: live from its start included to its end excluded
 * @param occurrence Start and end instants of the occurrence
 * @param now Instant the status holds at
 */
export const occurrenceStatus = (
    occurrence: { startsAt: Date; endsAt: Date },
    now: Date,
): OccurrenceStatus => {
    if (now < occurrence.startsAt) {
        return "upcoming"
    }
    return now < occurrence.endsAt ? "live" : "ended"
}
