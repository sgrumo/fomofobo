import { Avatar as AvatarPrimitive } from "@base-ui/react"
import { cn } from "frontend-shared/styles"
import type { ComponentProps, ReactNode } from "react"
import type { StrictOmit } from "shared/types"

import { normalizeBaseUiStyling } from "../styling/styling.helper"
import {
    avatarFallbackStyles,
    avatarImageStyles,
    avatarRootStyles,
} from "./avatar.styles"

interface AvatarProps extends StrictOmit<
    ComponentProps<typeof AvatarPrimitive.Root>,
    "children"
> {
    size?: "sm" | "md" | "lg"
    src: string | undefined
    fullName: string
    alt?: string
    fallback: ReactNode
    imageProps?: StrictOmit<ComponentProps<typeof AvatarPrimitive.Image>, "src" | "alt">
    fallbackProps?: StrictOmit<
        ComponentProps<typeof AvatarPrimitive.Fallback>,
        "children"
    >
}
export const Avatar = ({
    className: propClassName,
    size = "md",
    src,
    fullName,
    alt = `${fullName} avatar`,
    fallback,
    imageProps: { className: imagePropClassName, ...imageProps } = {},
    fallbackProps: { className: fallbackPropClassName, ...fallbackProps } = {},
    ...props
}: AvatarProps) => (
    <AvatarPrimitive.Root
        className={state =>
            cn(avatarRootStyles({ size }), normalizeBaseUiStyling(propClassName, state))
        }
        {...props}
    >
        <AvatarPrimitive.Image
            src={src}
            alt={alt}
            className={state =>
                cn(avatarImageStyles(), normalizeBaseUiStyling(imagePropClassName, state))
            }
            {...imageProps}
        />
        <AvatarPrimitive.Fallback
            className={state =>
                cn(
                    avatarFallbackStyles(),
                    normalizeBaseUiStyling(fallbackPropClassName, state),
                )
            }
            {...fallbackProps}
        >
            {fallback}
        </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
)
