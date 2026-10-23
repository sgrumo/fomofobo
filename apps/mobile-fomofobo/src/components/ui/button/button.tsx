import type { VariantProps } from "class-variance-authority"
import type { PixelIconName } from "domain/pixel-icons"
import { useState } from "react"
import type { ReactNode } from "react"
import { Pressable } from "react-native"
import type { StrictOmit } from "shared/types"

import { PixelIcon } from "@/components/ui/pixel-icon/pixel-icon"
import { TextClassContext } from "@/components/ui/text/text"
import { hardShadow, pressedHardShadow } from "@/lib/theme/hard-shadow"
import { cn } from "@/lib/utils/class-names"

import {
    buttonHitSlops,
    buttonIconColors,
    buttonIconSizes,
    buttonShadowColor,
    buttonTextVariants,
    buttonVariants,
} from "./button.styles"

type ButtonProps = StrictOmit<
    React.ComponentProps<typeof Pressable>,
    "style" | "children"
> &
    React.RefAttributes<typeof Pressable> &
    VariantProps<typeof buttonVariants> & {
        icon?: PixelIconName
        children?: ReactNode
    }

// The pressed state lives in React state: NativeWind drops a `style` function next to
// `className`. The spread comes first, so a `Link asChild` cannot replace the shadow style
const Button = ({
    className,
    variant,
    size,
    destructive,
    icon,
    onPressIn,
    onPressOut,
    children,
    ...props
}: ButtonProps) => {
    const [pressed, setPressed] = useState(false)
    const tone = variant ?? "primary"
    const scale = size ?? "md"
    const shadowColor = buttonShadowColor(tone, destructive === true)
    const flat = tone === "tertiary" || props.disabled === true

    return (
        <TextClassContext.Provider
            value={buttonTextVariants({ variant: tone, size: scale })}
        >
            <Pressable
                {...props}
                role="button"
                hitSlop={buttonHitSlops[scale]}
                className={cn(
                    buttonVariants({ variant: tone, size: scale, destructive }),
                    props.disabled === true && "opacity-50",
                    className,
                )}
                style={
                    flat
                        ? undefined
                        : pressed
                          ? pressedHardShadow(shadowColor)
                          : hardShadow("md", shadowColor)
                }
                onPressIn={event => {
                    setPressed(true)
                    onPressIn?.(event)
                }}
                onPressOut={event => {
                    setPressed(false)
                    onPressOut?.(event)
                }}
            >
                {icon !== undefined && (
                    <PixelIcon
                        name={icon}
                        size={buttonIconSizes[scale]}
                        color={buttonIconColors[tone]}
                    />
                )}
                {children}
            </Pressable>
        </TextClassContext.Provider>
    )
}

export { Button }
export type { ButtonProps }
