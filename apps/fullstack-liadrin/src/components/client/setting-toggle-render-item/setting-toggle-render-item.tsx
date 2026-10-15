"use client"

import { cn } from "frontend-shared/styles"
import type { ReactNode } from "react"
import { match } from "ts-pattern"

type SettingToggleRenderItemProps = {
    children: ReactNode
} & (
    | {
          toggledBy: "state"
          toggled: boolean
      }
    | {
          toggledBy: "document"
          toggledClassName: string
      }
)

export const SettingToggleRenderItem = (props: SettingToggleRenderItemProps) => {
    const { toggled, toggledClassName } = match(props)
        .with({ toggledBy: "state" }, stateProps => ({
            toggled: stateProps.toggled,
            toggledClassName: undefined,
        }))
        .with({ toggledBy: "document" }, documentProps => ({
            toggled: false,
            toggledClassName: documentProps.toggledClassName,
        }))
        .exhaustive()

    return (
        <span
            className={cn(
                {
                    "tp-b2-medium flex size-6.5 items-center justify-center rounded transition-colors [&>svg]:size-4": true,
                    "bg-primary-500 dark:bg-primary-300 text-white": toggled,
                    "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800":
                        !toggled,
                },
                toggledClassName,
            )}
        >
            {props.children}
        </span>
    )
}
