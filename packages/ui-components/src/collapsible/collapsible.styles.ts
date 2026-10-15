import { styles } from "frontend-shared/styles"

export const collapsibleRootStyles = styles(
    () =>
        "flex w-full flex-col rounded-lg border border-neutral-200 dark:border-neutral-700",
)

export const collapsibleTriggerStyles = styles(
    () =>
        "flex w-full items-center gap-2 p-4 text-left [&>svg]:transition-transform data-[panel-open]:[&>svg]:rotate-180",
)

export const collapsibleTriggerContentStyles = styles(
    () => "tp-b1-medium grow text-neutral-800 dark:text-neutral-100",
)

export const collapsibleTriggerIconStyles = styles(
    () => "size-5 text-neutral-500 dark:text-neutral-400",
)

export const collapsiblePanelStyles = styles(
    () =>
        "h-[var(--collapsible-panel-height)] overflow-hidden text-neutral-600 transition-[height] ease-out data-[ending-style]:h-0 data-[starting-style]:h-0 dark:text-neutral-300",
)

export const collapsibleContentStyles = styles(() => "tp-b2-regular px-4 pb-4")
