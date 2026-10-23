import {
    differenceInCalendarDays,
    eachDayOfInterval,
    endOfMonth,
    isBefore,
    startOfMonth,
    startOfWeek,
} from "date-fns"
import type { Locale } from "date-fns"

export interface DateRange {
    from?: Date
    to?: Date
}

const WEEK_DAYS = 7

/**
 * @description Returns the range after a tap on a day: a first tap or a tap before the start begins a range, a second tap ends it
 * @param range Range before the tap
 * @param day Day tapped
 */
export const nextDateRange = (range: DateRange, day: Date): DateRange =>
    range.from === undefined || range.to !== undefined || isBefore(day, range.from)
        ? { from: day }
        : { from: range.from, to: day }

/**
 * @description Builds the weeks of a month grid, with no day for the cells outside the month
 * @param month Any day of the month shown
 * @param locale Locale that sets the first day of the week
 */
export const monthWeeks = (
    month: Date,
    locale: Locale,
): Array<Array<Date | undefined>> => {
    const first = startOfMonth(month)
    const leading = differenceInCalendarDays(first, startOfWeek(first, { locale }))
    const cells = [
        ...Array.from({ length: leading }, () => undefined),
        ...eachDayOfInterval({ start: first, end: endOfMonth(month) }),
    ]
    return Array.from({ length: Math.ceil(cells.length / WEEK_DAYS) }, (_, week) => {
        const row = cells.slice(week * WEEK_DAYS, (week + 1) * WEEK_DAYS)
        return [
            ...row,
            ...Array.from({ length: WEEK_DAYS - row.length }, () => undefined),
        ]
    })
}
