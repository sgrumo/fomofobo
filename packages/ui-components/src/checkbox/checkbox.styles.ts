import { styles } from "frontend-shared/styles"

interface CheckboxRootStylesOpts {
    checked: boolean
    indeterminate: boolean
}
export const checkboxRootStyles = styles((opts: CheckboxRootStylesOpts) => [
    "outline-focus border-line inline-flex size-5 items-center justify-center rounded-sm border-2 outline-offset-2 transition-colors focus-visible:outline-2 disabled:cursor-not-allowed disabled:opacity-50",
    {
        "bg-surface enabled:hover:bg-surface-muted": !opts.checked && !opts.indeterminate,
        "bg-surface-inverse text-fg-inverse": opts.checked || opts.indeterminate,
    },
])
export const checkboxIndicatorStyles = styles(() => "[&>svg]:size-3")
export const checkboxGroupViewStyles = styles(() => "flex flex-col gap-1")
