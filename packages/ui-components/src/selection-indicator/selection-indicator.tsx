import { cn } from "frontend-shared/styles"
import { match } from "ts-pattern"

import { useUiContext } from "../i18n/ui-context"
import { IconCheck, IconHorizontalLine, IconXMark } from "../icons/icons"
import { inputViewRootStyles } from "../input/input.styles"
import {
    selectionIndicatorIconContainerStyles,
    selectionIndicatorIconStyles,
} from "./selection-indicator.styles"

interface SelectionIndicatorProps {
    selected: boolean
    indeterminate?: boolean
    size?: "sm" | "md"
    className?: string
}

export const SelectionIndicator = ({
    selected,
    indeterminate = false,
    size = "md",
    className,
}: SelectionIndicatorProps) => {
    const { i18n } = useUiContext()

    const state = match({ indeterminate, selected })
        .returnType<"indeterminate" | "checked" | "unchecked">()
        .with({ indeterminate: true }, () => "indeterminate")
        .with({ selected: true }, () => "checked")
        .otherwise(() => "unchecked")
    const iconClassName = selectionIndicatorIconStyles({ size })

    const { icon, label } = match(state)
        .with("indeterminate", () => ({
            icon: <IconHorizontalLine className={iconClassName} aria-hidden={true} />,
            label: i18n.t("SelectionIndicator.Indeterminate", undefined),
        }))
        .with("checked", () => ({
            icon: <IconCheck className={iconClassName} aria-hidden={true} />,
            label: i18n.t("SelectionIndicator.Selected", undefined),
        }))
        .with("unchecked", () => ({
            icon: <IconXMark className={iconClassName} aria-hidden={true} />,
            label: i18n.t("SelectionIndicator.NotSelected", undefined),
        }))
        .exhaustive()

    return (
        <div
            role="img"
            aria-label={label}
            className={cn(inputViewRootStyles({ size, forceSquare: true }), className)}
        >
            <div className={cn(selectionIndicatorIconContainerStyles())}>{icon}</div>
        </div>
    )
}
