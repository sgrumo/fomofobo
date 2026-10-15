import type { StrictExclude } from "./types"

/**
 * @description True when the value is neither `null` nor `undefined`
 * @template T Value type
 * @param value Value tested
 */
export const isDefined = <T>(
    value: T | null | undefined,
): value is StrictExclude<T | undefined | null, undefined | null> =>
    value !== null && value !== undefined
/**
 * @description Returns the value unchanged, checking it against the target type
 * @template T Target type
 * @param value Value checked
 */
export const enforceType = <T>(value: T): T => value
