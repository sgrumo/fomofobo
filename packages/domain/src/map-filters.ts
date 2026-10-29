import { format, isBefore, parseISO } from "date-fns"
import { countBy } from "es-toolkit"
import type { PublicSearchResponse } from "models"
import { match } from "ts-pattern"

import type { MapPointKind } from "./event-clusters"
import { localDateOf } from "./local-format"
import type { MapQuery } from "./map-query"
import { occurrenceStatus } from "./occurrence-status"
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

export const KIND_FILTERS: readonly MapPointKind[] = [
    "live",
    "upcoming",
    "permanent",
    "ended",
]

// Ended events and permanent venues stay off by default, so they do not crowd the map.
const SHOWN_BY_DEFAULT: Record<MapPointKind, boolean> = {
    live: true,
    upcoming: true,
    permanent: false,
    ended: false,
}

type KindQuery = Pick<
    MapQuery,
    "showLive" | "showUpcoming" | "showPermanent" | "showEnded"
>

/**
 * @description Returns the kinds of result the map shows under the query
 * @param query Kind filters of the map query
 */
export const shownKindsOf = (query: KindQuery): ReadonlySet<MapPointKind> =>
    new Set(
        KIND_FILTERS.filter(
            kind =>
                match(kind)
                    .with("live", () => query.showLive)
                    .with("upcoming", () => query.showUpcoming)
                    .with("permanent", () => query.showPermanent)
                    .with("ended", () => query.showEnded)
                    .exhaustive() ?? SHOWN_BY_DEFAULT[kind],
        ),
    )

/**
 * @description Returns the map query change of a tap on a kind chip, the key cleared when the
 * tap gives back the default
 * @param kind Kind of the chip
 * @param pressed True when the tap presses the chip
 */
export const kindQueryOf = (kind: MapPointKind, pressed: boolean): KindQuery => {
    const value = pressed === SHOWN_BY_DEFAULT[kind] ? undefined : pressed
    return match(kind)
        .returnType<KindQuery>()
        .with("live", () => ({ showLive: value }))
        .with("upcoming", () => ({ showUpcoming: value }))
        .with("permanent", () => ({ showPermanent: value }))
        .with("ended", () => ({ showEnded: value }))
        .exhaustive()
}

/**
 * @description Returns the kind of an occurrence result at an instant
 * @param occurrence Start and end instants of the occurrence
 * @param now Instant the kind holds at
 */
const kindOf = (
    occurrence: { startsAt: string; endsAt: string },
    now: Date,
): MapPointKind =>
    occurrenceStatus(
        { startsAt: new Date(occurrence.startsAt), endsAt: new Date(occurrence.endsAt) },
        now,
    )

/**
 * @description Returns the results the map shows: the occurrences of a shown status, and the
 * permanent venues when their kind is shown
 * @template TResults Search results
 * @param results Occurrences and permanent venues of a search
 * @param kinds Kinds shown
 * @param now Instant the status of each occurrence holds at
 */
export const shownResultsOf = <
    TResults extends {
        occurrences: ReadonlyArray<{ startsAt: string; endsAt: string }>
        permanentVenues: readonly unknown[]
    },
>(
    results: TResults,
    kinds: ReadonlySet<MapPointKind>,
    now: Date,
): TResults => ({
    ...results,
    occurrences: results.occurrences.filter(occurrence =>
        kinds.has(kindOf(occurrence, now)),
    ),
    permanentVenues: kinds.has("permanent") ? results.permanentVenues : [],
})

/**
 * @description Returns the result count of each kind, whatever kinds the map shows
 * @param results Occurrences and permanent venues of a search
 * @param now Instant the status of each occurrence holds at
 */
export const kindCountsOf = (
    results: {
        occurrences: ReadonlyArray<{ startsAt: string; endsAt: string }>
        permanentVenues: readonly unknown[]
    },
    now: Date,
): Record<MapPointKind, number> => {
    const counts: Partial<Record<MapPointKind, number>> = countBy(
        results.occurrences,
        occurrence => kindOf(occurrence, now),
    )
    return {
        live: counts.live ?? 0,
        upcoming: counts.upcoming ?? 0,
        permanent: results.permanentVenues.length,
        ended: counts.ended ?? 0,
    }
}

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
