import { styles } from "frontend-shared/styles"

import type { StepCompletion } from "./stepper.helper"

export const stepperRootStyles = styles(() => "flex w-full items-center")

interface StepperItemOpts {
    isLast: boolean
}
export const stepperItemStyles = styles((opts: StepperItemOpts) => [
    "flex items-center",
    { "flex-1": !opts.isLast },
])

export const stepperItemContentStyles = styles((opts: { interactive: boolean }) => [
    "focus-visible:outline-focus flex shrink-0 items-center gap-3 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2",
    {
        "cursor-pointer": opts.interactive,
        "cursor-default": !opts.interactive,
    },
])

interface StepperIndicatorOpts {
    completion: StepCompletion
    enabled: boolean
    current: boolean
}
export const stepperIndicatorStyles = styles((opts: StepperIndicatorOpts) => [
    "tp-pixel-md flex size-8 shrink-0 items-center justify-center rounded-full border-2 transition-all [&>svg]:size-4",
    opts.enabled
        ? {
              "border-line bg-surface-inverse text-fg-inverse": opts.completion === true,
              "border-line bg-surface-muted text-fg": opts.completion === "partially",
              "text-fg border-line bg-upcoming":
                  opts.completion === false && opts.current,
              "border-line-muted bg-surface text-fg-subtle":
                  opts.completion === false && !opts.current,
          }
        : "border-line-muted bg-surface-muted text-fg-subtle",
    {
        "ring-focus ring-offset-surface ring-2 ring-offset-2": opts.current,
    },
])

interface StepperLabelOpts {
    completion: StepCompletion
    enabled: boolean
    current: boolean
}
export const stepperLabelStyles = styles((opts: StepperLabelOpts) => [
    "tp-pixel-md whitespace-nowrap transition-colors",
    {
        "text-fg": opts.current || (opts.enabled && opts.completion !== false),
        "text-fg-muted": !opts.current && opts.enabled && opts.completion === false,
        "text-fg-subtle": !opts.current && !opts.enabled,
    },
])

interface StepperConnectorOpts {
    filled: boolean
}
export const stepperConnectorStyles = styles((opts: StepperConnectorOpts) => [
    "mx-3 h-0.5 flex-1 transition-colors",
    {
        "bg-surface-inverse": opts.filled,
        "bg-line-muted": !opts.filled,
    },
])
