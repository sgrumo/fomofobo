"use client"

import type { Category } from "models"
import { useTranslation } from "react-i18next"
import { Chip, ChipRow } from "ui-components/chip"
import { PixelIcon } from "ui-components/pixel-icons"

import type { RouteClientComponentProps } from "@/framework/routes/routes"

interface CategoryChipsProps extends RouteClientComponentProps<"root"> {
    categories: Category[]
    counts: ReadonlyMap<string, number> | undefined
    selected: string | undefined
    onSelect: (categoryId: string | undefined) => void
    className?: string
}

export const CategoryChips = (props: CategoryChipsProps) => {
    const { t } = useTranslation("shared")

    return (
        <ChipRow label={t("Filters.Categories")} className={props.className}>
            {props.categories.map(category => (
                <Chip
                    key={category.id}
                    label={category.name}
                    icon={<PixelIcon name={category.icon} />}
                    count={
                        props.counts === undefined
                            ? undefined
                            : (props.counts.get(category.id) ?? 0)
                    }
                    pressed={props.selected === category.id}
                    onPressedChange={pressed => {
                        props.onSelect(pressed ? category.id : undefined)
                    }}
                />
            ))}
        </ChipRow>
    )
}
