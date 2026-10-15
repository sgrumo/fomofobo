import { format, isValid, parseISO } from "date-fns"
import type { DateArg } from "date-fns"
import type { Locale } from "date-fns/locale"
import { clamp } from "es-toolkit"
import { match } from "ts-pattern"

import { err, ok } from "./result"
import type { Result } from "./result"
import { isDefined } from "./values"

/**
 * @description Returns the date as a `yyyy-MM-dd` string
 * @param value Date formatted
 * @remarks Yields `Invalid Date` for an invalid value
 */
export const isoDate = (value: DateArg<Date>): string =>
    isValid(value) ? format(value, "yyyy-MM-dd") : new Date(value).toString()
/**
 * @description Returns the local date of a `yyyy-MM-dd` string
 * @param value Date parsed
 * @remarks Yields an invalid date for a malformed value
 */
export const dateFromIso = (value: string): Date => parseISO(value)
/**
 * @description Returns the date formatted for the runtime locale
 * @param value Date formatted
 */
export const humanDate = (value: DateArg<Date>): string =>
    new Date(value).toLocaleDateString()

/**
 * @description Returns the date formatted with the template and the locale
 * @param value Date formatted
 * @param opts Template and locale driving the output
 * @remarks Yields `Invalid Date` for an invalid value
 */
export const formatDate = (
    value: DateArg<Date>,
    opts: { template: string; locale: Locale },
): string =>
    isValid(value)
        ? format(value, opts.template, { locale: opts.locale })
        : new Date(value).toString()

export interface Time {
    hours: number
    minutes: number
    seconds: number
    milliseconds: number
}

/**
 * @description Maps a `HH:mm:ss.SSS` string to its time segments
 * @param value Time string, seconds and milliseconds optional
 * @remarks Yields `NaN` for every non-numeric segment
 */
export const timeFromString = (value: string): Time => {
    const [timePart, millisecondsPart] = value.split(".")
    const segments = (timePart ?? value).split(":")
    return {
        hours: Number(segments[0] ?? 0),
        minutes: Number(segments[1] ?? 0),
        seconds: Number(segments[2] ?? 0),
        milliseconds: isDefined(millisecondsPart) ? Number(millisecondsPart) : 0,
    }
}

/**
 * @description Returns the time as a `HH:mm`, `HH:mm:ss`, or `HH:mm:ss.SSS` string
 * @param value Time formatted
 * @remarks Clamps negative hours and negative minutes to `0`
 */
export const isoTime = (value: Time): string => {
    const hours = String(clamp(value.hours, 0, Infinity)).padStart(2, "0")
    const minutes = String(clamp(value.minutes, 0, Infinity)).padStart(2, "0")
    const seconds =
        value.seconds > 0 || value.milliseconds > 0
            ? String(value.seconds).padStart(2, "0")
            : undefined
    const milliseconds =
        value.milliseconds > 0 ? String(value.milliseconds).padStart(3, "0") : undefined

    if (!isDefined(seconds)) {
        return `${hours}:${minutes}`
    }
    if (!isDefined(milliseconds)) {
        return `${hours}:${minutes}:${seconds}`
    }
    return `${hours}:${minutes}:${seconds}.${milliseconds}`
}

export type Month =
    | "january"
    | "february"
    | "march"
    | "april"
    | "may"
    | "june"
    | "july"
    | "august"
    | "september"
    | "october"
    | "november"
    | "december"

export const months = [
    "january",
    "february",
    "march",
    "april",
    "may",
    "june",
    "july",
    "august",
    "september",
    "october",
    "november",
    "december",
] as const satisfies Month[]

/**
 * @description Returns the month of the date, or an err for an invalid date
 * @param date Date read
 */
export const monthOfDate = (date: Date): Result<Month, "invalid-date"> => {
    if (!isValid(date)) {
        return err("invalid-date")
    }

    return match(date.getMonth())
        .returnType<Result<Month, "invalid-date">>()
        .with(0, () => ok("january"))
        .with(1, () => ok("february"))
        .with(2, () => ok("march"))
        .with(3, () => ok("april"))
        .with(4, () => ok("may"))
        .with(5, () => ok("june"))
        .with(6, () => ok("july"))
        .with(7, () => ok("august"))
        .with(8, () => ok("september"))
        .with(9, () => ok("october"))
        .with(10, () => ok("november"))
        .with(11, () => ok("december"))
        .otherwise(() => err("invalid-date"))
}

export type WeekDay =
    | "sunday"
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday"
    | "saturday"

export const weekDays = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
] as const satisfies WeekDay[]

/**
 * @description Returns a promise resolving after the delay
 * @param opts Delay, in milliseconds
 */
export const sleep = (opts: { ms: number }): Promise<void> =>
    new Promise(resolve => {
        setTimeout(resolve, opts.ms)
    })
