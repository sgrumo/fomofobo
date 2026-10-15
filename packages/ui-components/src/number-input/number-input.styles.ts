import { styles } from "frontend-shared/styles"

interface NumberInputStepTriggerIconStylesOpts {
    size: "sm" | "md"
    disabled: boolean
}
export const numberInputStepTriggerIconStyles = styles(
    (opts: NumberInputStepTriggerIconStylesOpts) => [
        "transition-all",
        {
            "size-4": opts.size === "md",
            "size-[0.83rem]": opts.size === "sm",
            "text-neutral-400 group-disabled:opacity-50 group-enabled:hover:text-neutral-500 dark:text-neutral-500 dark:group-enabled:hover:text-neutral-400":
                !opts.disabled,
            "text-neutral-400/75": opts.disabled,
        },
    ],
)
