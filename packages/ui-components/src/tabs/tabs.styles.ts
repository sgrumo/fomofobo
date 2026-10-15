import { styles } from "frontend-shared/styles"

export const tabsRootStyles = styles(() => "flex flex-col")

export const tabsListStyles = styles(() => "border-line-muted relative flex border-b")

export const tabsTabStyles = styles(
    () =>
        "tp-pixel-md data-[active]:text-fg text-fg-subtle not-data-[active]:hover:text-fg-muted data-[disabled]:text-fg-subtle data-[disabled]:hover:text-fg-subtle relative px-4 py-2.5 transition-colors",
)

export const tabsIndicatorStyles = styles(
    () =>
        "bg-surface-inverse absolute bottom-0 h-0.5 w-[var(--active-tab-width)] translate-x-[var(--active-tab-left)] translate-y-px transition-all duration-200 ease-out",
)

export const tabsPanelStyles = styles(() => "pt-4")
