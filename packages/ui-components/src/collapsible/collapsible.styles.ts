import { styles } from "frontend-shared/styles"

export const collapsibleRootStyles = styles(
    () => "border-line-muted flex w-full flex-col rounded-lg border",
)

export const collapsibleTriggerStyles = styles(
    () =>
        "flex w-full items-center gap-2 p-4 text-left [&>svg]:transition-transform data-[panel-open]:[&>svg]:rotate-180",
)

export const collapsibleTriggerContentStyles = styles(() => "tp-pixel-md text-fg grow")

export const collapsibleTriggerIconStyles = styles(() => "text-fg-muted size-5")

export const collapsiblePanelStyles = styles(
    () =>
        "text-fg-muted h-[var(--collapsible-panel-height)] overflow-hidden transition-[height] ease-out data-[ending-style]:h-0 data-[starting-style]:h-0",
)

export const collapsibleContentStyles = styles(() => "tp-body-md px-4 pb-4")
