import { cn } from "frontend-shared/styles"
import type { ReactNode } from "react"
import { match } from "ts-pattern"

import { useUiContext } from "../i18n/ui-context"
import { IconInfo, IconStop } from "../icons/icons"
import {
    fallbackBoxDescriptionStyles,
    fallbackBoxHeaderStyles,
    fallbackBoxIconStyles,
    fallbackBoxStyles,
    fallbackBoxTitleStyles,
} from "./fallback-box.styles"

type FallbackBoxProps =
    | {
          type: "error"
          title: ReactNode
          description?: ReactNode
          className?: string
      }
    | {
          type: "empty"
          title?: ReactNode
          description?: ReactNode
          className?: string
      }

export const FallbackBox = (props: FallbackBoxProps) => {
    const { i18n } = useUiContext()

    const icon = match(props)
        .with({ type: "error" }, () => <IconStop className={fallbackBoxIconStyles()} />)
        .with({ type: "empty" }, () => <IconInfo className={fallbackBoxIconStyles()} />)
        .exhaustive()

    const title = match(props)
        .with({ type: "error" }, matchedProps => matchedProps.title)
        .with(
            { type: "empty" },
            matchedProps =>
                matchedProps.title ?? i18n.t("FallbackBox.EmptyTitle", undefined),
        )
        .exhaustive()

    return (
        <div className={cn(fallbackBoxStyles(), props.className)}>
            <div className={fallbackBoxHeaderStyles()}>
                {icon}
                <span className={fallbackBoxTitleStyles()}>{title}</span>
            </div>
            {props.description && (
                <span className={fallbackBoxDescriptionStyles()}>
                    {props.description}
                </span>
            )}
        </div>
    )
}
