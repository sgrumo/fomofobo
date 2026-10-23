import type { OccurrenceStatus } from "models"
import { match } from "ts-pattern"

import { dayMonthOf, localDateOf, localTimeOf } from "./local-format"

export interface PinStart {
    time: string
    // `dd/MM` of a start on another day than today, undefined for today
    day: string | undefined
}

export type PinTag =
    | { type: "live" }
    | { type: "start"; text: string }
    | { type: "ended" }

/**
 * @description Returns the `HH:mm` start of an occurrence, with its `dd/MM` date when it starts on another day than today
 * @param startsAt Start instant of the occurrence
 * @param now Instant that sets today
 * @param timeZone IANA zone of the wall clock
 */
export const pinStartOf = (startsAt: Date, now: Date, timeZone: string): PinStart => ({
    time: localTimeOf(startsAt, timeZone),
    day:
        localDateOf(startsAt, timeZone) === localDateOf(now, timeZone)
            ? undefined
            : dayMonthOf(startsAt, timeZone),
})

/**
 * @description Returns the tag of a pin: live, ended, else the start date on another day or the start time today
 * @param status Status of the occurrence
 * @param start Start of the occurrence
 */
export const pinTagOf = (status: OccurrenceStatus, start: PinStart): PinTag =>
    match(status)
        .returnType<PinTag>()
        .with("live", () => ({ type: "live" }))
        .with("upcoming", () => ({ type: "start", text: start.day ?? start.time }))
        .with("ended", () => ({ type: "ended" }))
        .exhaustive()
