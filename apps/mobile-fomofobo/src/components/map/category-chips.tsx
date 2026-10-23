import { categoryCountOf, categoryQueryOf } from "domain/map-filters"
import type { MapQuery } from "domain/map-query"
import type { Category, PublicSearchResponse } from "models"
import { useTranslation } from "react-i18next"

import { Chip, ChipRow } from "@/components/ui/chip/chip"

interface CategoryChipsProps {
    categories: readonly Category[]
    counts: PublicSearchResponse["categoryCounts"] | undefined
    selected: string | undefined
    onChange: (change: MapQuery) => void
}

export const CategoryChips = (props: CategoryChipsProps) => {
    const { t } = useTranslation("shared")

    return (
        <ChipRow label={t("Filters.Categories")} wrap={true}>
            {props.categories.map(category => (
                <Chip
                    key={category.id}
                    label={category.name}
                    icon={category.icon}
                    count={
                        props.counts === undefined
                            ? undefined
                            : categoryCountOf(props.counts, category.id)
                    }
                    pressed={props.selected === category.id}
                    onPressedChange={pressed => {
                        props.onChange(categoryQueryOf(category.id, pressed))
                    }}
                />
            ))}
        </ChipRow>
    )
}
