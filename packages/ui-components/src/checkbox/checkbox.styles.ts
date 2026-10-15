import { styles } from "frontend-shared/styles"

interface CheckboxRootStylesOpts {
    checked: boolean
    indeterminate: boolean
}
export const checkboxRootStyles = styles((opts: CheckboxRootStylesOpts) => [
    "outline-primary-500 inline-flex size-4 items-center justify-center rounded-sm border outline-offset-1 transition-colors focus-visible:outline-1 disabled:cursor-not-allowed disabled:opacity-50",
    {
        "border-neutral-500 bg-white enabled:hover:bg-neutral-200 dark:bg-neutral-900 dark:enabled:hover:bg-neutral-700":
            !opts.checked && !opts.indeterminate,
        "border-primary-600 bg-primary-600 text-primary-100 enabled:hover:bg-primary-800 dark:border-primary-300 dark:bg-primary-300 dark:enabled:hover:bg-primary-200 dark:text-black":
            opts.checked || opts.indeterminate,
    },
])
export const checkboxIndicatorStyles = styles(() => "[&>svg]:size-3")
export const checkboxGroupViewStyles = styles(() => "flex flex-col gap-1")
