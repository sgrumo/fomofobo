import { styles } from "frontend-shared/styles"

export const otpInputRootStyles = styles(() => "inline-flex items-center gap-2")

interface OtpInputSlotStylesOpts {
    size: "sm" | "md"
    disabled: boolean
    error: boolean
}
export const otpInputSlotStyles = styles((opts: OtpInputSlotStylesOpts) => [
    "tp-b2-regular appearance-none rounded-lg bg-white text-center outline-1 -outline-offset-1 transition-colors dark:bg-neutral-900",
    "enabled:hover:bg-neutral-100 dark:enabled:hover:bg-neutral-800",
    "disabled:cursor-not-allowed disabled:opacity-75",
    {
        "outline-neutral-400 dark:outline-neutral-600": !opts.error,
        "focus-visible:outline-primary-600 dark:focus-visible:outline-primary-300":
            !opts.error,
        "outline-danger-600 dark:outline-danger-400": opts.error && !opts.disabled,
        "size-8": opts.size === "sm",
        "size-10": opts.size === "md",
    },
])

export const otpInputSeparatorStyles = styles(
    () => "h-px w-2 shrink-0 rounded-full bg-neutral-400 dark:bg-neutral-600",
)
