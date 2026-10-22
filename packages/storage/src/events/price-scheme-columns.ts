import type { PriceScheme } from "models"

import type { events } from "../db-schema"

type PriceSchemeRow = Pick<
    typeof events.$inferSelect,
    | "isFree"
    | "fullPriceCents"
    | "reducedPrices"
    | "membershipName"
    | "membershipCostCents"
    | "minimumAge"
    | "priceNotes"
>

/**
 * @description Maps a price scheme to the columns of `events` that store it
 * @param scheme Price scheme written
 */
export const priceSchemeColumns = (scheme: PriceScheme): PriceSchemeRow => ({
    isFree: scheme.isFree,
    fullPriceCents: scheme.fullPriceCents,
    reducedPrices: scheme.reducedPrices,
    membershipName: scheme.membership?.name ?? null,
    membershipCostCents: scheme.membership?.costCents ?? null,
    minimumAge: scheme.minimumAge,
    priceNotes: scheme.notes,
})

/**
 * @description Maps the price columns of an `events` row to its price scheme
 * @param row Price columns of the row
 */
export const toPriceScheme = (row: PriceSchemeRow): PriceScheme => ({
    isFree: row.isFree,
    fullPriceCents: row.fullPriceCents,
    reducedPrices: row.reducedPrices,
    membership:
        row.membershipName === null
            ? null
            : { name: row.membershipName, costCents: row.membershipCostCents },
    minimumAge: row.minimumAge,
    notes: row.priceNotes,
})
