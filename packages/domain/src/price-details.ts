import type { PriceScheme } from "models"
import { isDefined } from "shared/values"

export type PriceDetailRow =
    | { type: "free" }
    | { type: "full"; cents: number }
    | { type: "reduced"; index: number; label: string; cents: number }
    | { type: "membership"; name: string; costCents: number | null }
    | { type: "minimum-age"; age: number }
    | { type: "notes"; text: string }

/**
 * @description Returns the rows of the full price scheme, none when one row says no more than the summary
 * @param scheme Price scheme detailed
 */
export const priceDetailRows = (scheme: PriceScheme): PriceDetailRow[] => {
    const rows: Array<PriceDetailRow | undefined> = [
        scheme.isFree ? { type: "free" } : undefined,
        scheme.fullPriceCents === null
            ? undefined
            : { type: "full", cents: scheme.fullPriceCents },
        ...scheme.reducedPrices.map((reduced, index): PriceDetailRow => ({
            type: "reduced",
            index,
            label: reduced.label,
            cents: reduced.amountCents,
        })),
        scheme.membership === null
            ? undefined
            : {
                  type: "membership",
                  name: scheme.membership.name,
                  costCents: scheme.membership.costCents,
              },
        scheme.minimumAge === null
            ? undefined
            : { type: "minimum-age", age: scheme.minimumAge },
        scheme.notes === null ? undefined : { type: "notes", text: scheme.notes },
    ]
    const defined = rows.filter(isDefined)
    return defined.length <= 1 ? [] : defined
}
