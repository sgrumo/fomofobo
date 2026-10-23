import { cva } from "class-variance-authority"

import type { ThemeColor } from "@/lib/theme/theme-tokens"

export const buttonVariants = cva("flex-row items-center justify-center rounded-md", {
    variants: {
        variant: {
            primary: "border-2 border-line bg-surface-inverse",
            accent: "border-2 border-line bg-social",
            secondary: "border-2 border-line bg-surface",
            tertiary: "bg-transparent",
        },
        size: {
            sm: "min-h-9 gap-1 px-3 py-1",
            md: "min-h-11 gap-2 px-4 py-2.5",
        },
        destructive: {
            true: "",
            false: "",
        },
    },
    compoundVariants: [{ variant: "primary", destructive: true, className: "bg-danger" }],
    defaultVariants: { variant: "primary", size: "md", destructive: false },
})

export const buttonTextVariants = cva("", {
    variants: {
        variant: {
            primary: "text-fg-inverse",
            accent: "text-fg",
            secondary: "text-fg",
            tertiary: "text-fg",
        },
        size: {
            sm: "tp-pixel-sm",
            md: "tp-pixel-md",
        },
    },
    defaultVariants: { variant: "primary", size: "md" },
})

export const buttonIconColors = {
    primary: "fg-inverse",
    accent: "fg",
    secondary: "fg",
    tertiary: "fg",
} as const satisfies Record<string, ThemeColor>

export const buttonIconSizes = { sm: 12, md: 16 } as const

// Brings `sm` (36 pt) to the 44 pt target
export const buttonHitSlops = { sm: 4, md: undefined } as const

/**
 * @description Returns the shadow color of a button, red under the primary button as on the web
 * @param variant Button variant
 * @param destructive True when the button deletes or discards
 */
export const buttonShadowColor = (
    variant: keyof typeof buttonIconColors,
    destructive: boolean,
): ThemeColor => (variant === "primary" && !destructive ? "live" : "line")
