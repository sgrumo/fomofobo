import { styles } from "frontend-shared/styles"

export const accordionRootStyles = styles(() => "flex flex-col gap-6")

export const accordionItemStyles = styles(
    () =>
        "border-b border-neutral-200 bg-white transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:bg-neutral-800",
)

export const accordionTriggerStyles = styles(
    () =>
        "flex w-full items-center gap-2 p-4 text-left [&>svg]:transition-transform data-[panel-open]:[&>svg]:rotate-180",
)

export const accordionTriggerIconStyles = styles(
    () => "size-5 text-neutral-500 dark:text-neutral-400",
)

export const accordionTriggerContentStyles = styles(
    () => "tp-b1-medium grow text-neutral-800 dark:text-neutral-100",
)

export const accordionPanelStyles = styles(
    () =>
        "h-[var(--accordion-panel-height)] overflow-hidden text-neutral-600 transition-[height] ease-out data-[ending-style]:h-0 data-[starting-style]:h-0 dark:text-neutral-300",
)

export const accordionContentStyles = styles(() => "tp-b2-regular px-4 pb-4")
