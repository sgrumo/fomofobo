import { localDateOf } from "./local-format"
import { PLATFORM_TIME_ZONE } from "./platform"

/**
 * @description Returns the local date that a check-in of an active device counts for
 * @param now Instant of the check-in
 */
export const checkInDateOf = (now: Date): string => localDateOf(now, PLATFORM_TIME_ZONE)

/**
 * @description True when the device has not checked in on the local date of an instant yet
 * @param lastCheckInDate Local date of the last check-in sent, `null` before the first
 * @param now Instant compared
 */
export const isCheckInDue = (lastCheckInDate: string | null, now: Date): boolean =>
    lastCheckInDate !== checkInDateOf(now)
