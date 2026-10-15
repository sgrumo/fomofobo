import { styles } from "frontend-shared/styles"

import type { SliderSize } from "./slider.helper"

interface SliderSizeOpts {
    size: SliderSize
}

export const sliderRootStyles = styles(() => "w-full")

export const sliderControlStyles = styles((opts: SliderSizeOpts) => [
    "relative flex w-full touch-none items-center select-none",
    {
        "h-5": opts.size === "sm",
        "h-6": opts.size === "md",
    },
])

export const sliderTrackStyles = styles((opts: SliderSizeOpts) => [
    "relative grow rounded-full bg-neutral-200 dark:bg-neutral-700",
    {
        "h-1.5": opts.size === "sm",
        "h-2": opts.size === "md",
    },
])

export const sliderIndicatorStyles = styles(() => [
    "bg-primary-600 dark:bg-primary-300 absolute h-full rounded-full",
])

export const sliderThumbStyles = styles((opts: SliderSizeOpts) => [
    "enabled:data-[dragging]:border-primary-600 has-[:focus-visible]:outline-primary-500 dark:has-[:focus-visible]:outline-primary-200 has-[:focus-visible]:border-primary-500 dark:has-[:focus-visible]:border-primary-200 absolute rounded-full border border-neutral-400 bg-white shadow-sm transition-[border-color,background] hover:bg-neutral-100 enabled:cursor-grab disabled:cursor-not-allowed disabled:opacity-50 has-[:focus-visible]:outline-3 has-[:focus-visible]:-outline-offset-1 dark:shadow-none dark:hover:bg-neutral-200",
    {
        "size-4": opts.size === "sm",
        "size-5": opts.size === "md",
    },
])
