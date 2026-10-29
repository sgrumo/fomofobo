import type { MapPointKind } from "domain/event-clusters"
import { KIND_FILTERS, kindQueryOf } from "domain/map-filters"
import type { MapQuery } from "domain/map-query"
import { useTranslation } from "react-i18next"

import { Chip, ChipRow } from "@/components/ui/chip/chip"

interface KindChipsProps {
    shown: ReadonlySet<MapPointKind>
    onChange: (change: MapQuery) => void
}

// No count and no icon, so a phone fits the four chips in one row
export const KindChips = (props: KindChipsProps) => {
    const { t } = useTranslation("shared")

    return (
        <ChipRow label={t("Filters.Kinds")}>
            {KIND_FILTERS.map(kind => (
                <Chip
                    key={kind}
                    label={t(`Filters.Kind.${kind}`)}
                    tone={kind}
                    pressed={props.shown.has(kind)}
                    onPressedChange={pressed => {
                        props.onChange(kindQueryOf(kind, pressed))
                    }}
                />
            ))}
        </ChipRow>
    )
}
