import { tz } from "@date-fns/tz"
import { addDays, format, getDay, parseISO, startOfDay } from "date-fns"
import type { PublicSearchQuery } from "models"
import { match } from "ts-pattern"

import { DEFAULT_WINDOW_DAYS } from "../platform/platform"

export interface DateWindow {
    from: Date
    to: Date
}

/**
 * @description Returns the local `yyyy-MM-dd` date of an instant in the zone
 * @param instant Instant read
 * @param timeZone IANA zone of the wall clock
 */
export const localDateOf = (instant: Date, timeZone: string): string =>
    format(instant, "yyyy-MM-dd", { in: tz(timeZone) })

/**
 * @description Returns the window of a date filter as instants, `to` excluded
 * @param filter Date filter kind with the bounds of a custom range
 * @param now Instant that sets today
 * @param timeZone IANA zone of the wall clock
 * @remarks Fills a missing bound of a range with the bound of the default window
 */
export const dateWindow = (
    filter: Pick<PublicSearchQuery, "date" | "from" | "to">,
    now: Date,
    timeZone: string,
): DateWindow => {
    const zone = { in: tz(timeZone) }
    const today = startOfDay(now, zone)
    const day = (offset: number): Date => addDays(today, offset, zone)

    const bounds = match(filter.date)
        // PLACEHOLDER(OP-01)
        .with("default", () => ({ from: today, to: day(DEFAULT_WINDOW_DAYS) }))
        .with("today", () => ({ from: today, to: day(1) }))
        .with("tomorrow", () => ({ from: day(1), to: day(2) }))
        // PLACEHOLDER(OP-07): Saturday 00:00 to Monday 00:00, the current weekend on a Sunday
        .with("weekend", () => {
            const weekday = getDay(today, zone)
            const saturdayOffset = weekday === 0 ? -1 : 6 - weekday
            return { from: day(saturdayOffset), to: day(saturdayOffset + 2) }
        })
        .with("range", () => ({
            from: filter.from === undefined ? today : parseISO(filter.from, zone),
            to:
                filter.to === undefined
                    ? day(DEFAULT_WINDOW_DAYS)
                    : addDays(parseISO(filter.to, zone), 1, zone),
        }))
        .exhaustive()

    return { from: new Date(bounds.from), to: new Date(bounds.to) }
}
