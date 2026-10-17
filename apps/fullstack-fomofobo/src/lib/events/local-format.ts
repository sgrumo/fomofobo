import { tz } from "@date-fns/tz"
import { format } from "date-fns"

/**
 * @description Returns the `HH:mm` wall-clock time of an instant in the zone
 * @param instant Instant read
 * @param timeZone IANA zone of the wall clock
 */
export const localTimeOf = (instant: Date, timeZone: string): string =>
    format(instant, "HH:mm", { in: tz(timeZone) })

/**
 * @description Returns the `dd.MM.yy` date of an instant in the zone
 * @param instant Instant read
 * @param timeZone IANA zone of the wall clock
 */
export const shortDateOf = (instant: Date, timeZone: string): string =>
    format(instant, "dd.MM.yy", { in: tz(timeZone) })

/**
 * @description Returns the short weekday and the `dd.MM` date of an instant in the zone, in
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
    return `${weekday} ${format(instant, "dd.MM", { in: tz(timeZone) })}`
}
