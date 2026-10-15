import { styles } from "frontend-shared/styles"

export const tabsRootStyles = styles(() => "flex flex-col")

export const tabsListStyles = styles(
    () => "relative flex border-b border-neutral-200 dark:border-neutral-700",
)

export const tabsTabStyles = styles(
    () =>
        "tp-b2-medium data-[active]:text-primary-600 dark:data-[active]:text-primary-300 relative px-4 py-2.5 text-neutral-400 transition-colors not-data-[active]:hover:text-neutral-600 data-[disabled]:text-neutral-300 data-[disabled]:hover:text-neutral-300 dark:text-neutral-500 dark:not-data-[active]:hover:text-neutral-300 dark:data-[disabled]:text-neutral-500 dark:data-[disabled]:hover:text-neutral-500",
)

export const tabsIndicatorStyles = styles(
    () =>
        "bg-primary-600 dark:bg-primary-300 absolute bottom-0 h-0.5 w-[var(--active-tab-width)] translate-x-[var(--active-tab-left)] translate-y-px transition-all duration-200 ease-out",
)

export const tabsPanelStyles = styles(() => "pt-4")
