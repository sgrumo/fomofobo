import { format, isBefore, parseISO } from "date-fns"
import type { PublicSearchResponse } from "models"

import { localDateOf } from "./local-format"
import type { MapQuery } from "./map-query"
import { PLATFORM_TIME_ZONE } from "./platform"

export const QUICK_DATE_KINDS = ["today", "tomorrow", "weekend"] as const

type QuickDateKind = (typeof QUICK_DATE_KINDS)[number]

type DateQuery = Pick<MapQuery, "date" | "from" | "to">

export const NO_DATE_FILTER: DateQuery = {
    date: undefined,
    from: undefined,
    to: undefined,
}

/**
 * @description Returns the map query change of a tap on a category chip
 * @param categoryId Category of the chip
 * @param pressed True when the tap presses the chip
 */
export const categoryQueryOf = (categoryId: string, pressed: boolean): MapQuery => ({
    category: pressed ? categoryId : undefined,
})

/**
 * @description Returns the map query change of a tap on a quick date chip
 * @param kind Date filter of the chip
 * @param pressed True when the tap presses the chip
 */
export const quickDateQueryOf = (kind: QuickDateKind, pressed: boolean): DateQuery =>
    pressed ? { ...NO_DATE_FILTER, date: kind } : NO_DATE_FILTER

/**
 * @description Returns the map query change of a custom date range
 * @param from First day of the range, a midnight of the device
 * @param to Last day of the range, a midnight of the device
 */
export const rangeQueryOf = (from: Date, to: Date): DateQuery => ({
    date: "range",
    from: format(from, "yyyy-MM-dd"),
    to: format(to, "yyyy-MM-dd"),
})

/**
 * @description Returns the map query change of a tap on the free chip
 * @param free True when the tap presses the chip
 */
export const freeQueryOf = (free: boolean): MapQuery => ({
    free: free ? true : undefined,
})

/**
 * @description True when the map query holds a category, a date filter or the free filter
 * @param query Map query
 */
export const hasActiveFilters = (
    query: Pick<MapQuery, "category" | "date" | "free">,
): boolean =>
    query.category !== undefined || query.date !== undefined || query.free === true

/**
 * @description Returns the result count of a category under the other filters, 0 when the
 * response misses it
 * @param categoryCounts Category counts of the search response
 * @param categoryId Category counted
 */
export const categoryCountOf = (
    categoryCounts: PublicSearchResponse["categoryCounts"],
    categoryId: string,
): number => categoryCounts.find(entry => entry.categoryId === categoryId)?.count ?? 0

// PLACEHOLDER(OP-09): a range starts today at the earliest
/**
 * @description Returns the earliest day a custom range may start, a midnight of the device
 * @param now Current instant
 * @remarks Returns the day of the platform zone, so a device in another zone still starts
 * on the platform day
 */
export const earliestRangeDayOf = (now: Date): Date =>
    parseISO(localDateOf(now, PLATFORM_TIME_ZONE))

/**
 * @description True when a custom range starts no earlier than the earliest day and ends no
 * earlier than its start
 * @param from First day of the range
 * @param to Last day of the range
 * @param earliest Earliest day a range may start
 */
export const isValidRange = (from: Date, to: Date, earliest: Date): boolean =>
    !isBefore(from, earliest) && !isBefore(to, from)

/**
 * @description Returns the `dd/MM–dd/MM` label of the custom range of the map query, undefined
 * with no complete custom range
 * @param query Date filter of the map query
 */
export const rangeLabelOf = (query: DateQuery): string | undefined =>
    query.date === "range" && query.from !== undefined && query.to !== undefined
        ? `${format(parseISO(query.from), "dd/MM")}–${format(parseISO(query.to), "dd/MM")}`
        : undefined
