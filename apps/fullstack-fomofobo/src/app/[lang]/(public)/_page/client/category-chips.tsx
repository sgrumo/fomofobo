"use client"

import {
    categoryChipOrderOf,
    categoryCountOf,
    categoryQueryOf,
    freeQueryOf,
} from "domain/map-filters"
import type { MapQuery } from "domain/map-query"
import type { Category, PublicSearchResponse } from "models"
import { useTranslation } from "react-i18next"
import { Chip, ChipRow } from "ui-components/chip"
import { PixelIcon } from "ui-components/pixel-icons"

import type { RouteClientComponentProps } from "@/framework/routes/routes"

interface CategoryChipsProps extends RouteClientComponentProps<"root"> {
    categories: Category[]
    counts: PublicSearchResponse["categoryCounts"] | undefined
    selected: string | undefined
    free: boolean
    onChange: (change: MapQuery) => void
    className?: string
}

export const CategoryChips = (props: CategoryChipsProps) => {
    const { t } = useTranslation("shared")

    return (
        <ChipRow label={t("Filters.Categories")} className={props.className}>
            {categoryChipOrderOf(props.categories).map(category => (
                <Chip
                    key={category.id}
                    label={category.name}
                    icon={<PixelIcon name={category.icon} />}
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
