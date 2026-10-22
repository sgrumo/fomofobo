import { tz } from "@date-fns/tz"
import { format } from "date-fns"
import type { LocalDateTime } from "models"

/**
 * @description Returns the `HH:mm` wall-clock time of an instant in the zone
 * @param instant Instant read
 * @param timeZone IANA zone of the wall clock
 */
export const localTimeOf = (instant: Date, timeZone: string): string =>
    format(instant, "HH:mm", { in: tz(timeZone) })

/**
 * @description Returns the `dd/MM` date of an instant in the zone
 * @param instant Instant read
 * @param timeZone IANA zone of the wall clock
 */
export const dayMonthOf = (instant: Date, timeZone: string): string =>
    format(instant, "dd/MM", { in: tz(timeZone) })

/**
 * @description Returns the `dd/MM/yyyy HH:mm` date and time of an instant in the zone
 * @param instant Instant read
 * @param timeZone IANA zone of the wall clock
 */
export const dateTimeOf = (instant: Date, timeZone: string): string =>
    format(instant, "dd/MM/yyyy HH:mm", { in: tz(timeZone) })

/**
 * @description Returns the short weekday and the `dd/MM` date of an instant in the zone, in
 * the language
 * @param instant Instant read
 * @param timeZone IANA zone of the wall clock
 * @param language BCP 47 language of the weekday
 */
export const weekdayDateOf = (
    instant: Date,
    timeZone: string,
    language: string,
): string => {
    const weekday = new Intl.DateTimeFormat(language, { weekday: "short", timeZone })
        .format(instant)
        .replace(/\.$/u, "")
    return `${weekday} ${format(instant, "dd/MM", { in: tz(timeZone) })}`
}

/**
 * @description Returns the `dd.MM.yy HH:mm` wall-clock text of a local date and time
 * @param localDateTime Date and time with no zone, `2026-10-24T21:00` for instance
 */
export const formatLocalDateTime = (localDateTime: LocalDateTime): string =>
    `${localDateTime.slice(8, 10)}.${localDateTime.slice(5, 7)}.${localDateTime.slice(2, 4)} ${localDateTime.slice(11, 16)}`
