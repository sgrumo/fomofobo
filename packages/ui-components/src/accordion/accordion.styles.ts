import { styles } from "frontend-shared/styles"

export const accordionRootStyles = styles(() => "flex flex-col gap-6")

export const accordionItemStyles = styles(
    () => "border-line bg-surface hover:bg-surface-muted border-b-2 transition-colors",
)

export const accordionTriggerStyles = styles(
    () =>
        "focus-visible:outline-focus flex w-full items-center gap-2 p-4 text-left focus-visible:outline-2 focus-visible:-outline-offset-2 [&>svg]:transition-transform data-[panel-open]:[&>svg]:rotate-180",
)

export const accordionTriggerIconStyles = styles(() => "text-fg size-5")

export const accordionTriggerContentStyles = styles(() => "tp-pixel-md text-fg grow")

export const accordionPanelStyles = styles(
    () =>
        "text-fg h-[var(--accordion-panel-height)] overflow-hidden transition-[height] ease-out data-[ending-style]:h-0 data-[starting-style]:h-0",
)

export const accordionContentStyles = styles(() => "tp-body-md px-4 pb-4")
