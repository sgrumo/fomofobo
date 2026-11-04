"use client"

import { categoryChipOrderOf, categoryQueryOf, freeQueryOf } from "domain/map-filters"
import type { MapQuery } from "domain/map-query"
import type { Category } from "models"
import { useTranslation } from "react-i18next"
import { Chip, ChipRow } from "ui-components/chip"

import type { RouteClientComponentProps } from "@/framework/routes/routes"

import { CategoryGlyph } from "./category-glyph"

interface CategoryChipsProps extends RouteClientComponentProps<"root"> {
    categories: Category[]
    selected: readonly string[] | undefined
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
                    icon={
                        // A span keeps the glyph out of the icon size of the chip, so each cell stays 2px
                        <span className="flex">
                            <CategoryGlyph
                                route={props.route}
                                icon={category.icon}
                                cellPx={2}
                                className="fill-current"
                            />
                        </span>
                    }
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
