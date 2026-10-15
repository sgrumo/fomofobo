import { styles } from "frontend-shared/styles"

export const tabsRootStyles = styles(() => "flex flex-col")

export const tabsListStyles = styles(() => "border-line relative flex border-b-2")

export const tabsTabStyles = styles(
    () =>
        "tp-pixel-md data-[active]:text-fg text-fg-muted not-data-[active]:hover:text-fg data-[disabled]:text-fg-subtle data-[disabled]:hover:text-fg-subtle focus-visible:outline-focus relative px-4 py-2.5 transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2",
)

export const tabsIndicatorStyles = styles(
    () =>
        "bg-live absolute bottom-0 h-1 w-[var(--active-tab-width)] translate-x-[var(--active-tab-left)] translate-y-0.5 transition-all duration-200 ease-out",
)

export const tabsPanelStyles = styles(() => "pt-4")
