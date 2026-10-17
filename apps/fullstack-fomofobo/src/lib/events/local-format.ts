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
