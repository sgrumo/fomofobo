import { tz } from "@date-fns/tz"
import {
    addDays,
    differenceInCalendarDays,
    getDay,
    parseISO,
    setHours,
    startOfDay,
} from "date-fns"
import { DEFAULT_WINDOW_DAYS } from "domain/platform"
import { dayPartSchema } from "models"
import type { DayPart, PublicSearchQuery } from "models"
import { match } from "ts-pattern"

/**
 * @remarks Lets an occurrence that starts in the first hours after a date window count for it, as a party at 00:30 belongs to the night before
 */
export const NIGHT_START_GRACE_MS = 2 * 60 * 60 * 1000

export interface DateWindow {
    from: Date
    to: Date
}

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

/**
 * @remarks Lets the evening run to 06:00 of the next day, so a night out counts for its evening
 */
export const DAY_PART_HOURS: Record<DayPart, { start: number; end: number }> = {
    morning: { start: 6, end: 12 },
    afternoon: { start: 12, end: 18 },
    evening: { start: 18, end: 30 },
}

/**
 * @description Returns the windows of the day parts on each day of a date window, in order,
 * with the windows that touch merged into one
 * @param window Date window, from a midnight of the zone
 * @param dayParts Day parts kept
 * @param timeZone IANA zone of the wall clock
 */
export const dayPartWindows = (
    window: DateWindow,
    dayParts: readonly DayPart[],
    timeZone: string,
): DateWindow[] => {
    const zone = { in: tz(timeZone) }
    const parts = dayPartSchema.options.filter(part => dayParts.includes(part))
    const hourOf = (day: Date, hours: number): Date =>
        new Date(setHours(addDays(day, Math.floor(hours / 24), zone), hours % 24, zone))
    const days = Array.from(
        { length: differenceInCalendarDays(window.to, window.from, zone) },
        (_, offset) => addDays(window.from, offset, zone),
    )

    return days
        .flatMap(day =>
            parts.map(part => ({
                from: hourOf(day, DAY_PART_HOURS[part].start),
                to: hourOf(day, DAY_PART_HOURS[part].end),
            })),
        )
        .reduce<DateWindow[]>((merged, next) => {
            const last = merged.at(-1)
            if (last !== undefined && last.to.getTime() >= next.from.getTime()) {
                last.to = next.to
            } else {
                merged.push(next)
            }
            return merged
        }, [])
}
