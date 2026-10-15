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
            "text-fg-subtle group-enabled:hover:text-fg-muted group-disabled:opacity-50":
                !opts.disabled,
            "text-fg-subtle/75": opts.disabled,
        },
    ],
)
