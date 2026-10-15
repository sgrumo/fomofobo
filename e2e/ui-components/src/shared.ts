import type { Locator, Page } from "@playwright/test"
import { match, P } from "ts-pattern"

export type Scope = Page | Locator

export type TextMatch = ["exact", string] | ["contains", string] | ["regex", RegExp]

/**
 * @description Returns the page of a scope
 * @param scope Search root
 */
export const pageOf = (scope: Scope): Page => ("goto" in scope ? scope : scope.page())

/**
 * @description Escapes every regex metacharacter in the value
 * @param value Raw text
 */
export const escapeRegex = (value: string): string =>
    value.replaceAll(/[.*+?^${}()|[\]\\]/gu, String.raw`\$&`)

/**
 * @description Returns a regex usable as a locator name or hasText filter
 * @param textMatch Item text matcher
 */
export const textMatchToRegex = (textMatch: TextMatch): RegExp =>
    match(textMatch)
        .with(
            ["exact", P.string],
            ([, value]) => new RegExp(`^${escapeRegex(value)}$`, "u"),
        )
        .with(["contains", P.string], ([, value]) => new RegExp(escapeRegex(value), "u"))
        .with(["regex", P.instanceOf(RegExp)], ([, pattern]) => pattern)
        .exhaustive()

/**
 * @remarks Indexes the `ui` keys `Months.Full.*` and `Months.Short.*`, index 0 = January
 */
export const monthKeys = [
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
] as const

/**
 * @description Returns the month key by 0-based index
 * @param monthIndex 0-based month index
 * @remarks Falls back to "january" for out-of-range input
 */
export const monthKeyOf = (monthIndex: number): string =>
    monthKeys[monthIndex] ?? "january"

/**
 * @description True when the rendered value satisfies the text matcher
 * @param textMatch Item text matcher
 * @param value Rendered text
 */
export const textMatchTest = (textMatch: TextMatch, value: string): boolean =>
    match(textMatch)
        .with(["exact", P.string], ([, expected]) => value === expected)
        .with(["contains", P.string], ([, expected]) => value.includes(expected))
        .with(["regex", P.instanceOf(RegExp)], ([, pattern]) => pattern.test(value))
        .exhaustive()
