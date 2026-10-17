import { TZDate, tz } from "@date-fns/tz"
import {
    addDays,
    addMonths,
    differenceInCalendarDays,
    differenceInCalendarMonths,
    format,
    getDate,
    getDay,
    getHours,
    getMinutes,
    max,
    parseISO,
    startOfDay,
    startOfMonth,
} from "date-fns"
import type { EventUpsert, RecurrenceRule } from "models"
import { err, ok } from "shared/result"
import type { Result } from "shared/result"
import { weekDays } from "shared/temporal"
import { match } from "ts-pattern"

import { MAX_OCCURRENCES_PER_EVENT } from "../platform/platform"

export interface ExpandedOccurrence {
    localDate: string
    startsAt: Date
    endsAt: Date
}

/** @remarks Reads wall-clock dates in UTC, which has no DST, so calendar arithmetic never shifts a day */
const CALENDAR = { in: tz("UTC") }

/** @remarks Counts the rarest monthly date, the fifth of a weekday, which falls in at least 4 months of any 12 */
const MIN_MONTHLY_DATES_PER_YEAR = 4

/**
 * @description Returns the local `yyyy-MM-dd` date of a calendar date
 * @param date Calendar date
 */
const toLocalDate = (date: Date): string => format(date, "yyyy-MM-dd", CALENDAR)

/**
 * @description Builds the instant of a wall-clock date and time in the zone
 * @param date Calendar date
 * @param time Calendar date that carries the hours and minutes
 * @param timeZone IANA zone of the wall clock
 * @remarks Moves a time inside a DST gap one hour forward, and picks the first instant of a DST overlap
 */
const toInstant = (date: Date, time: Date, timeZone: string): Date =>
    new Date(
        new TZDate(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            getHours(time),
            getMinutes(time),
            timeZone,
        ),
    )

/**
 * @description True when a lower bound of the rule dates exceeds the occurrences an event holds, without listing them
 * @param first Calendar date of the first occurrence
 * @param rule Recurrence rule
 */
const exceedsLimit = (first: Date, rule: RecurrenceRule): boolean => {
    const until = parseISO(rule.until, CALENDAR)
    return match(rule.frequency)
        .with(
            "weekly",
            () =>
                Math.floor((differenceInCalendarDays(until, first) + 1) / 7) >
                MAX_OCCURRENCES_PER_EVENT,
        )
        .with(
            "monthly",
            () =>
                Math.floor(differenceInCalendarMonths(until, first) / 12) *
                    MIN_MONTHLY_DATES_PER_YEAR >
                MAX_OCCURRENCES_PER_EVENT,
        )
        .exhaustive()
}

/**
 * @description Returns the calendar dates of the rule, from the first date to `until` inclusive
 * @param first Calendar date of the first occurrence
 * @param rule Recurrence rule
 */
const ruleDates = (first: Date, rule: RecurrenceRule): Date[] => {
    const until = parseISO(rule.until, CALENDAR)
    const months = differenceInCalendarMonths(until, first) + 1
    return (
        match(rule)
            .with({ frequency: "weekly" }, weekly => {
                const weekdayIndexes = new Set(
                    weekly.weekdays.map(day => weekDays.indexOf(day)),
                )
                return Array.from(
                    { length: differenceInCalendarDays(until, first) + 1 },
                    (_, n) => addDays(first, n),
                ).filter(date => weekdayIndexes.has(getDay(date)))
            })
            // `addMonths` clamps to the month end: the filter skips a month without the day
            .with({ frequency: "monthly", mode: "day-of-month" }, () =>
                Array.from({ length: months }, (_, n) => addMonths(first, n)).filter(
                    date => getDate(date) === getDate(first),
                ),
            )
            // A month without the nth weekday is skipped
            .with({ frequency: "monthly", mode: "weekday-position" }, () => {
                const weekOfMonth = Math.ceil(getDate(first) / 7)
                return Array.from({ length: months }, (_, n) => {
                    const monthStart = startOfMonth(addMonths(first, n))
                    const firstWeekday = (getDay(first) - getDay(monthStart) + 7) % 7
                    return {
                        monthStart,
                        date: addDays(monthStart, firstWeekday + (weekOfMonth - 1) * 7),
                    }
                })
                    .filter(
                        ({ monthStart, date }) =>
                            differenceInCalendarMonths(date, monthStart) === 0,
                    )
                    .map(({ date }) => date)
            })
            .exhaustive()
            .filter(date => differenceInCalendarDays(until, date) >= 0)
    )
}

/**
 * @description Builds the occurrences of an event in the zone, sorted by start
 * @param event Local start, local end and recurrence of the event
 * @param timeZone IANA zone of the wall clock
 */
export const expandOccurrences = (
    event: Pick<EventUpsert, "startsAt" | "endsAt" | "recurrence">,
    timeZone: string,
): Result<ExpandedOccurrence[], "too-many-occurrences"> => {
    const firstStart = parseISO(event.startsAt, CALENDAR)
    const firstEnd = parseISO(event.endsAt, CALENDAR)
    const firstDay = startOfDay(firstStart)
    const { recurrence } = event

    if (recurrence !== null && exceedsLimit(firstDay, recurrence.rule)) {
        return err("too-many-occurrences")
    }

    const removedDates = new Set(recurrence?.removedDates)
    const localDates = [
        ...new Set([
            toLocalDate(firstDay),
            ...(recurrence === null
                ? []
                : ruleDates(firstDay, recurrence.rule).map(toLocalDate)),
            ...(recurrence?.addedDates ?? []),
        ]),
    ]
        .filter(localDate => !removedDates.has(localDate))
        .toSorted()

    if (localDates.length > MAX_OCCURRENCES_PER_EVENT) {
        return err("too-many-occurrences")
    }

    const endDayOffset = differenceInCalendarDays(firstEnd, firstStart)
    return ok(
        localDates.map(localDate => {
            const date = parseISO(localDate, CALENDAR)
            const startsAt = toInstant(date, firstStart, timeZone)
            const endsAt = toInstant(addDays(date, endDayOffset), firstEnd, timeZone)
            // A start moved out of a DST gap can pass the end
            return { localDate, startsAt, endsAt: max([startsAt, endsAt]) }
        }),
    )
}
