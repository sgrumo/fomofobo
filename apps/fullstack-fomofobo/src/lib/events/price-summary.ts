import type { PriceScheme } from "models"

export type PriceSummaryPart =
    | { type: "free" }
    | { type: "amount"; cents: number }
    | { type: "from"; cents: number }
    | { type: "notes"; text: string }
    | { type: "paid" }
    | { type: "membership" }
    | { type: "minimum-age"; age: number }

const EURO_LOCALE = "it-IT"

export const FREE_PRICE_SCHEME: PriceScheme = {
    isFree: true,
    fullPriceCents: null,
    reducedPrices: [],
    membership: null,
    minimumAge: null,
    notes: null,
}

/**
 * @description Returns the euro text of an amount in cents, with no decimals for a whole amount
 * @param cents Amount in cents
 */
export const formatEuroCents = (cents: number): string =>
    new Intl.NumberFormat(EURO_LOCALE, {
        style: "currency",
        currency: "EUR",
        minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
    }).format(cents / 100)

/**
 * @description Returns the price part of the summary: free, the one amount, the lowest of several, else the notes, else paid
 * @param scheme Price scheme summarized
 */
const pricePartOf = (scheme: PriceScheme): PriceSummaryPart => {
    if (scheme.isFree) {
        return { type: "free" }
    }
    const amounts = [
        ...(scheme.fullPriceCents === null ? [] : [scheme.fullPriceCents]),
        ...scheme.reducedPrices.map(reduced => reduced.amountCents),
    ]
    if (amounts.length > 0) {
        return {
            type: amounts.length === 1 ? "amount" : "from",
            cents: Math.min(...amounts),
        }
    }
    return scheme.notes === null
        ? { type: "paid" }
        : { type: "notes", text: scheme.notes }
}

/**
 * @description Returns the parts of the one-line price summary: the price, then the card and the age
 * @param scheme Price scheme summarized
 */
export const priceSummaryParts = (scheme: PriceScheme): PriceSummaryPart[] => {
    const membership: PriceSummaryPart[] =
        scheme.membership === null ? [] : [{ type: "membership" }]
    const minimumAge: PriceSummaryPart[] =
        scheme.minimumAge === null
            ? []
            : [{ type: "minimum-age", age: scheme.minimumAge }]
    return [pricePartOf(scheme), ...membership, ...minimumAge]
}
