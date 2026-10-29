"use client"

import type { MapPointKind } from "domain/event-clusters"
import { KIND_FILTERS, kindQueryOf } from "domain/map-filters"
import type { MapQuery } from "domain/map-query"
import { useTranslation } from "react-i18next"
import { Chip, ChipRow } from "ui-components/chip"

import type { RouteClientComponentProps } from "@/framework/routes/routes"

interface KindChipsProps extends RouteClientComponentProps<"root"> {
    shown: ReadonlySet<MapPointKind>
    onChange: (change: MapQuery) => void
    className?: string
}

export const KindChips = (props: KindChipsProps) => {
    const { t } = useTranslation("shared")

    return (
        <ChipRow label={t("Filters.Kinds")} className={props.className}>
            {KIND_FILTERS.map(kind => (
                <Chip
                    key={kind}
                    label={t(`Filters.Kind.${kind}`)}
                    tone={kind}
                    pressed={props.shown.has(kind)}
                    onPressedChange={pressed => {
                        props.onChange(kindQueryOf(kind, pressed))
                    }}
                    className="justify-center max-md:grow"
                />
            ))}
        </ChipRow>
    )
}
