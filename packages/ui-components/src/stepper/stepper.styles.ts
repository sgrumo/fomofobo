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
    "focus-visible:outline-primary-200 flex shrink-0 items-center gap-3 rounded-full outline-none focus-visible:outline-2 focus-visible:outline-offset-2",
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
    "tp-b2-medium flex size-8 shrink-0 items-center justify-center rounded-full border transition-all [&>svg]:size-4",
    opts.enabled
        ? {
              "border-primary-600 bg-primary-600 dark:border-primary-300 dark:bg-primary-300 text-white dark:text-neutral-900":
                  opts.completion === true,
              "border-primary-600 bg-primary-100 text-primary-700 dark:border-primary-100 dark:text-neutral-900":
                  opts.completion === "partially",
              "text-primary-600 dark:text-primary-300 border-neutral-300 bg-white dark:border-neutral-600 dark:bg-neutral-900":
                  opts.completion === false && opts.current,
              "border-neutral-300 bg-white text-neutral-400 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-500":
                  opts.completion === false && !opts.current,
          }
        : "border-neutral-200 bg-neutral-50 text-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-500",
    {
        "ring-primary-200 ring-2 ring-offset-2 ring-offset-white dark:ring-offset-neutral-900":
            opts.current,
    },
])

interface StepperLabelOpts {
    completion: StepCompletion
    enabled: boolean
    current: boolean
}
export const stepperLabelStyles = styles((opts: StepperLabelOpts) => [
    "whitespace-nowrap transition-colors",
    {
        "tp-b2-semibold text-primary-700 dark:text-primary-200": opts.current,
        "tp-b2-medium": !opts.current,
        "text-neutral-800 dark:text-neutral-100":
            !opts.current && opts.enabled && opts.completion !== false,
        "text-neutral-500 dark:text-neutral-400":
            !opts.current && opts.enabled && opts.completion === false,
        "text-neutral-300 dark:text-neutral-500": !opts.current && !opts.enabled,
    },
])

interface StepperConnectorOpts {
    filled: boolean
}
export const stepperConnectorStyles = styles((opts: StepperConnectorOpts) => [
    "mx-3 h-0.5 flex-1 rounded-full transition-colors",
    {
        "bg-primary-600 dark:bg-primary-300": opts.filled,
        "bg-neutral-200 dark:bg-neutral-700": !opts.filled,
    },
])
