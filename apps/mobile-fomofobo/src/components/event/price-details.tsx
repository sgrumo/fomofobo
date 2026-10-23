import { priceDetailRows } from "domain/price-details"
import { formatEuroCents } from "domain/price-summary"
import type { PriceScheme } from "models"
import { useTranslation } from "react-i18next"
import { View } from "react-native"
import { match } from "ts-pattern"

import { KeyValueList } from "@/components/ui/key-value-list/key-value-list"
import { Text } from "@/components/ui/text/text"

interface PriceDetailsProps {
    priceScheme: PriceScheme
}

export const PriceDetails = (props: PriceDetailsProps) => {
    const { t } = useTranslation("shared")
    const rows = priceDetailRows(props.priceScheme).map(row =>
        match(row)
            .with({ type: "free" }, () => ({
                key: "entry",
                label: t("Detail.Prices.Entry"),
                value: t("Price.Free"),
            }))
            .with({ type: "full" }, full => ({
                key: "full",
                label: t("Detail.Prices.Full"),
                value: formatEuroCents(full.cents),
            }))
            .with({ type: "reduced" }, reduced => ({
                key: `reduced-${String(reduced.index)}`,
                label: reduced.label,
                value: formatEuroCents(reduced.cents),
            }))
            .with({ type: "membership" }, membership => ({
                key: "membership",
                label: t("Detail.Prices.Membership"),
                value:
                    membership.costCents === null
                        ? membership.name
                        : `${membership.name} · ${formatEuroCents(membership.costCents)}`,
            }))
            .with({ type: "minimum-age" }, minimumAge => ({
                key: "minimum-age",
                label: t("Detail.Prices.MinimumAge"),
                value: t("Price.MinimumAge", { age: minimumAge.age }),
            }))
            .with({ type: "notes" }, notes => ({
                key: "notes",
                label: t("Detail.Prices.Notes"),
                value: notes.text,
            }))
            .exhaustive(),
    )

    return rows.length === 0 ? undefined : (
        <View className="gap-2">
            <Text
                variant="pixel-sm"
                accessibilityRole="header"
                className="uppercase text-fg-muted"
            >
                {t("Detail.Prices.Label")}
            </Text>
            <KeyValueList items={rows} />
        </View>
    )
}
