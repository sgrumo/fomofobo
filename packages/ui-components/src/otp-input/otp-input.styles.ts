import { styles } from "frontend-shared/styles"

export const otpInputRootStyles = styles(() => "inline-flex items-center gap-2")

interface OtpInputSlotStylesOpts {
    size: "sm" | "md"
    disabled: boolean
    error: boolean
}
export const otpInputSlotStyles = styles((opts: OtpInputSlotStylesOpts) => [
    "tp-body-md bg-surface appearance-none rounded-lg text-center outline-1 -outline-offset-1 transition-colors",
    "enabled:hover:bg-surface-muted",
    "disabled:cursor-not-allowed disabled:opacity-75",
    {
        "outline-line": !opts.error,
        "focus-visible:outline-focus": !opts.error,
        "outline-danger": opts.error && !opts.disabled,
        "size-8": opts.size === "sm",
        "size-10": opts.size === "md",
    },
])

export const otpInputSeparatorStyles = styles(
    () => "bg-fg-subtle h-px w-2 shrink-0 rounded-full",
)
