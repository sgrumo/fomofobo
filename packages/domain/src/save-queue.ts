import { HttpStatus } from "models"
import type { OccurrenceRef, SaveChange } from "models"

/**
 * @description True when the two refs name the same occurrence
 * @param left First ref
 * @param right Second ref
 */
export const isSameOccurrence = (left: OccurrenceRef, right: OccurrenceRef): boolean =>
    left.eventId === right.eventId && left.date === right.date

/**
 * @description Returns the queue with the change at its end, in place of an earlier change of the same occurrence
 * @param pending Changes not sent yet
 * @param change Latest change of one occurrence
 * @remarks Keeps the latest change only, never cancels two out: the earlier one may already have reached the API
 */
export const queueSaveChange = (
    pending: SaveChange[],
    change: SaveChange,
): SaveChange[] => [...pending.filter(entry => !isSameOccurrence(entry, change)), change]

/**
 * @description Returns the queue without the change sent, unless a later change of the same occurrence replaced it
 * @param pending Changes not sent yet
 * @param sent Change the API accepted or refused for good
 */
export const dropSentSaveChange = (
    pending: SaveChange[],
    sent: SaveChange,
): SaveChange[] =>
    pending.filter(
        entry => !isSameOccurrence(entry, sent) || entry.action !== sent.action,
    )

/**
 * @description True when the API refused a change for good, so a retry would fail the same way: a client error other than a rate limit
 * @param status HTTP status of the refusal
 */
export const isFinalSaveRefusal = (status: number): boolean =>
    status >= HttpStatus.BadRequest &&
    status < HttpStatus.InternalError &&
    status !== HttpStatus.TooManyRequests
