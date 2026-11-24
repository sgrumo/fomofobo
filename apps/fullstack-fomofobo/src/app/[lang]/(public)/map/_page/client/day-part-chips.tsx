"use client"

import { DAY_PARTS, dayPartQueryOf } from "domain/map-filters"
import type { MapQuery } from "domain/map-query"
import { useTranslation } from "react-i18next"
import { Chip, ChipBar, ChipRow } from "ui-components/chip"

import type { RouteClientComponentProps } from "@/framework/routes/routes"

interface DayPartChipsProps extends RouteClientComponentProps<"map"> {
    selected: MapQuery["dayParts"]
    onChange: (change: MapQuery) => void
    className?: string
}

export const DayPartChips = (props: DayPartChipsProps) => {
    const { t } = useTranslation("shared")

    return (
        <ChipRow label={t("Filters.DayParts")} className={props.className}>
            <ChipBar label={t("Filters.DayParts")}>
                {DAY_PARTS.map(part => (
                    <Chip
                        key={part}
                        label={t(`Filters.DayPart.${part}`)}
                        pressed={props.selected?.includes(part) === true}
                        onPressedChange={pressed => {
                            props.onChange(dayPartQueryOf(props.selected, part, pressed))
                        }}
                    />
                ))}
            </ChipBar>
        </ChipRow>
    )
}
