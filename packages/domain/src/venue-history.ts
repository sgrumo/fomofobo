import type { VenueHistoryItem } from "models"

import { formatLocalDate } from "./local-format"

export const VENUE_HISTORY_PAGE_SIZE = 20

/**
 * @description Returns the `dd/MM/yyyy` date of a past event of a venue, or its `first → last`
 * span when it ran on more than one day
 * @param item Past event of the venue
 */
export const historyDatesOf = (
    item: Pick<VenueHistoryItem, "firstDate" | "lastDate">,
): string => {
    const firstDate = formatLocalDate(item.firstDate)
    const lastDate = formatLocalDate(item.lastDate)
    return firstDate === lastDate ? firstDate : `${firstDate} → ${lastDate}`
}
