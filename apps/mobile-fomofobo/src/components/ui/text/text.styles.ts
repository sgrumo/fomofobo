import { cva } from "class-variance-authority"
import type { VariantProps } from "class-variance-authority"

import { COMPACT_MAX_FONT_SCALE, MAX_FONT_SCALE } from "@/lib/theme/font-scale"

export const textVariants = cva("text-fg", {
    variants: {
        variant: {
            "pixel-2xl": "tp-pixel-2xl",
            "pixel-xl": "tp-pixel-xl",
            "pixel-lg": "tp-pixel-lg",
            "pixel-md": "tp-pixel-md",
            "pixel-sm": "tp-pixel-sm",
            "body-lg": "tp-body-lg",
            "body-md": "tp-body-md",
            "body-sm": "tp-body-sm",
            // The count of a map cluster, as the `font-count` text of the web cluster
            count: "pt-px font-count text-[22px] leading-[22px]",
        },
    },
    defaultVariants: {
        variant: "body-lg",
    },
})

type TextVariant = NonNullable<VariantProps<typeof textVariants>["variant"]>

const COMPACT_TEXT_VARIANTS: ReadonlySet<TextVariant> = new Set([
    "pixel-2xl",
    "pixel-xl",
    "count",
])

/**
 * @description Returns the cap of the system text size on a text variant
 * @param variant Text variant, none for the default
 */
export const maxFontScaleOf = (variant: TextVariant | null | undefined) =>
    COMPACT_TEXT_VARIANTS.has(variant ?? "body-lg")
        ? COMPACT_MAX_FONT_SCALE
        : MAX_FONT_SCALE
