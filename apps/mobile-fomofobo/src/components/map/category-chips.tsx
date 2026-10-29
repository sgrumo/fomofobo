import { categoryChipOrderOf, categoryQueryOf, freeQueryOf } from "domain/map-filters"
import type { MapQuery } from "domain/map-query"
import type { Category } from "models"
import { useTranslation } from "react-i18next"

import { Chip, ChipRow } from "@/components/ui/chip/chip"

interface CategoryChipsProps {
    categories: readonly Category[]
    selected: readonly string[] | undefined
    free: boolean
    onChange: (change: MapQuery) => void
}

export const CategoryChips = (props: CategoryChipsProps) => {
    const { t } = useTranslation("shared")

    return (
        <ChipRow label={t("Filters.Categories")} wrap={true}>
            {categoryChipOrderOf(props.categories).map(category => (
                <Chip
                    key={category.id}
                    label={category.name}
                    icon={category.icon}
                    pressed={props.selected?.includes(category.id) === true}
                    onPressedChange={pressed => {
                        props.onChange(
                            categoryQueryOf(props.selected, category.id, pressed),
                        )
                    }}
                />
            ))}
            <Chip
                label={t("Price.Free")}
                pressed={props.free}
                onPressedChange={free => {
                    props.onChange(freeQueryOf(free))
                }}
            />
        </ChipRow>
    )
}
