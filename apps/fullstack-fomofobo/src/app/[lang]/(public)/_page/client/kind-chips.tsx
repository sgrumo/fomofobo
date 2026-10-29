"use client"

import type { MapPointKind } from "domain/event-clusters"
import { KIND_FILTERS, kindQueryOf } from "domain/map-filters"
import type { MapQuery } from "domain/map-query"
import { cn } from "frontend-shared/styles"
import { useTranslation } from "react-i18next"
import { Chip, ChipRow } from "ui-components/chip"

import type { RouteClientComponentProps } from "@/framework/routes/routes"

const SWATCH_CLASSES: Record<MapPointKind, string> = {
    live: "bg-live",
    upcoming: "bg-upcoming",
    permanent: "bg-permanent",
    ended: "bg-ended",
}

interface KindChipsProps extends RouteClientComponentProps<"root"> {
    shown: ReadonlySet<MapPointKind>
    // Drops the swatch, so a phone fits the four chips in one row
    compact: boolean
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
                    icon={
                        props.compact ? undefined : (
                            <span
                                className={cn(
                                    "border-line block size-2.5 border-2",
                                    SWATCH_CLASSES[kind],
                                )}
                            />
                        )
                    }
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
