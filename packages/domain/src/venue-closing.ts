import type { Venue } from "models"
import { weekDays } from "shared/temporal"
import type { WeekDay } from "shared/temporal"

export const WEEK_FROM_MONDAY: readonly WeekDay[] = [...weekDays.slice(1), "sunday"]

export type ClosingInfo =
    | { type: "unknown" }
    | { type: "always-open" }
    | { type: "closed"; days: WeekDay[] }

/**
 * @description Returns what a venue shows of its closing days: nothing known for a regular
 * venue whose days nobody set, open every day, or the days it closes from Monday on
 * @param venue Kind and closing days of the venue, `null` days when nobody set them
 */
export const closingInfoOf = (
    venue: Pick<Venue, "kind" | "closingDays">,
): ClosingInfo => {
    const closingDays = venue.closingDays
    if (closingDays === null) {
        return venue.kind === "regular" ? { type: "unknown" } : { type: "always-open" }
    }
    return closingDays.length === 0
        ? { type: "always-open" }
        : {
              type: "closed",
              days: WEEK_FROM_MONDAY.filter(day => closingDays.includes(day)),
          }
}
