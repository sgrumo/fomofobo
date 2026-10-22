import type { PriceScheme } from "models"
import { useTranslation } from "react-i18next"
import { match } from "ts-pattern"

import { formatEuroCents, priceSummaryParts } from "@/lib/events/price-summary"

/**
 * @description Returns a function that writes the one-line price summary of a scheme, such as "da 5 € · 18+"
 */
export const usePriceSummary = () => {
    const { t } = useTranslation("shared")

    return (scheme: PriceScheme): string =>
        priceSummaryParts(scheme)
            .map(part =>
                match(part)
                    .with({ type: "free" }, () => t("Price.Free"))
                    .with({ type: "amount" }, amount => formatEuroCents(amount.cents))
                    .with({ type: "from" }, from =>
                        t("Price.From", { price: formatEuroCents(from.cents) }),
                    )
                    .with({ type: "notes" }, notes => notes.text)
                    .with({ type: "paid" }, () => t("Price.Paid"))
                    .with({ type: "membership" }, () => t("Price.Membership"))
                    .with({ type: "minimum-age" }, minimumAge =>
                        t("Price.MinimumAge", { age: minimumAge.age }),
                    )
                    .exhaustive(),
            )
            .join(" · ")
}
