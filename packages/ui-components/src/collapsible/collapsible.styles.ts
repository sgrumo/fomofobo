import { styles } from "frontend-shared/styles"

export const collapsibleRootStyles = styles(
    () =>
        "border-line bg-surface shadow-hard-md flex w-full flex-col rounded-lg border-2",
)

export const collapsibleTriggerStyles = styles(
    () =>
        "focus-visible:outline-focus flex w-full items-center gap-2 rounded-[inherit] p-4 text-left focus-visible:outline-2 focus-visible:-outline-offset-2 [&>svg]:transition-transform data-[panel-open]:[&>svg]:rotate-180",
)

export const collapsibleTriggerContentStyles = styles(() => "tp-pixel-md text-fg grow")

export const collapsibleTriggerIconStyles = styles(() => "text-fg size-5")

export const collapsiblePanelStyles = styles(
    () =>
        "text-fg h-[var(--collapsible-panel-height)] overflow-hidden transition-[height] ease-out data-[ending-style]:h-0 data-[starting-style]:h-0",
)

export const collapsibleContentStyles = styles(() => "tp-body-md px-4 pb-4")
