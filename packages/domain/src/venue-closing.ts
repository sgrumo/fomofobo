import type { VenueClosingDays } from "models"
import { weekDays } from "shared/temporal"
import type { WeekDay } from "shared/temporal"

export const WEEK_FROM_MONDAY: readonly WeekDay[] = [...weekDays.slice(1), "sunday"]

export type ClosingInfo =
    | { type: "unknown" }
    | { type: "always-open" }
    | { type: "closed"; days: WeekDay[] }

/**
 * @description Returns what a venue shows of its closing days: nothing known, open every day, or
 * the days it closes from Monday on
 * @param closingDays Closing days of the venue, `null` when nobody set them
 */
export const closingInfoOf = (closingDays: VenueClosingDays | null): ClosingInfo => {
    if (closingDays === null) {
        return { type: "unknown" }
    }
    return closingDays.length === 0
        ? { type: "always-open" }
        : {
              type: "closed",
              days: WEEK_FROM_MONDAY.filter(day => closingDays.includes(day)),
          }
}
