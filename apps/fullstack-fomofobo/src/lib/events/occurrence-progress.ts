import { clamp } from "es-toolkit"

/**
 * @description Returns the elapsed fraction and the remaining milliseconds of an occurrence at an instant, clamped to the occurrence
 * @param occurrence Start and end instants of the occurrence
 * @param now Instant the progress holds at
 */
export const occurrenceProgress = (
    occurrence: { startsAt: Date; endsAt: Date },
    now: Date,
): { elapsedFraction: number; remainingMs: number } => {
    const durationMs = occurrence.endsAt.getTime() - occurrence.startsAt.getTime()
    const elapsedMs = clamp(now.getTime() - occurrence.startsAt.getTime(), 0, durationMs)
    return {
        elapsedFraction: durationMs === 0 ? 1 : elapsedMs / durationMs,
        remainingMs: durationMs - elapsedMs,
    }
}
