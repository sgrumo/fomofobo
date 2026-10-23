import { cva } from "class-variance-authority"

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
        },
    },
    defaultVariants: {
        variant: "body-lg",
    },
})
