import { styles } from "frontend-shared/styles"

interface CheckboxRootStylesOpts {
    checked: boolean
    indeterminate: boolean
}
export const checkboxRootStyles = styles((opts: CheckboxRootStylesOpts) => [
    "outline-focus border-line inline-flex size-4 items-center justify-center rounded-sm border outline-offset-1 transition-colors focus-visible:outline-1 disabled:cursor-not-allowed disabled:opacity-50",
    {
        "bg-surface enabled:hover:bg-line-muted": !opts.checked && !opts.indeterminate,
        "bg-surface-inverse text-fg-inverse": opts.checked || opts.indeterminate,
    },
])
export const checkboxIndicatorStyles = styles(() => "[&>svg]:size-3")
export const checkboxGroupViewStyles = styles(() => "flex flex-col gap-1")
