import { lt, valid } from "semver"
import type { z } from "zod"

export type Semver = string & z.$brand<"Semver">

/**
 * @description True when `semver` can compare the value
 * @param value Version string read
 */
export const isSemver = (value: string): boolean => valid(value) !== null

/**
 * @description True when the first version is lower than the second
 * @param version Version compared
 * @param other Version compared against
 */
export const isVersionLower = (version: Semver, other: Semver): boolean =>
    lt(version, other)
