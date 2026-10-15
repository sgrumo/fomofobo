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
    "bg-surface border-line relative grow rounded-sm border-2",
    {
        "h-2.5": opts.size === "sm",
        "h-3": opts.size === "md",
    },
])

export const sliderIndicatorStyles = styles(() => ["bg-surface-inverse absolute h-full"])

export const sliderThumbStyles = styles((opts: SliderSizeOpts) => [
    "has-[:focus-visible]:outline-focus border-line bg-upcoming shadow-hard-sm hover:bg-surface absolute rounded-full border-2 transition-[border-color,background] enabled:cursor-grab disabled:cursor-not-allowed disabled:opacity-50 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2",
    {
        "size-4": opts.size === "sm",
        "size-5": opts.size === "md",
    },
])
