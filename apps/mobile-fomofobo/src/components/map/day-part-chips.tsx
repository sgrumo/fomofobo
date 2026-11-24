import { DAY_PARTS, dayPartQueryOf } from "domain/map-filters"
import type { MapQuery } from "domain/map-query"
import { useTranslation } from "react-i18next"

import { Chip, ChipBar, ChipRow } from "@/components/ui/chip/chip"

interface DayPartChipsProps {
    selected: MapQuery["dayParts"]
    onChange: (change: MapQuery) => void
}

export const DayPartChips = (props: DayPartChipsProps) => {
    const { t } = useTranslation("shared")

    return (
        <ChipRow label={t("Filters.DayParts")} wrap={true}>
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
