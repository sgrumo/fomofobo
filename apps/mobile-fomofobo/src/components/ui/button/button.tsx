import type { VariantProps } from "class-variance-authority"
import type { PixelIconName } from "domain/pixel-icons"
import type { ReactNode } from "react"
import type { Pressable } from "react-native"
import type { StrictOmit } from "shared/types"

import { PixelIcon } from "@/components/ui/pixel-icon/pixel-icon"
import { PressBounce } from "@/components/ui/press-bounce/press-bounce"
import { TextClassContext } from "@/components/ui/text/text"
import { hardShadow } from "@/lib/theme/hard-shadow"
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

const Button = ({
    className,
    variant,
    size,
    destructive,
    icon,
    children,
    ...props
}: ButtonProps) => {
    const tone = variant ?? "primary"
    const scale = size ?? "md"
    const shadowColor = buttonShadowColor(tone, destructive === true)
    const flat = tone === "tertiary" || props.disabled === true

    return (
        <TextClassContext.Provider
            value={buttonTextVariants({ variant: tone, size: scale })}
        >
            <PressBounce
                {...props}
                role="button"
                hitSlop={buttonHitSlops[scale]}
                className={cn(
                    buttonVariants({ variant: tone, size: scale, destructive }),
                    props.disabled === true && "opacity-50",
                    className,
                )}
                bounce={{ scale: 0.95, shift: !flat }}
                styleOf={pressed =>
                    flat ? undefined : hardShadow(pressed ? "sm" : "md", shadowColor)
                }
            >
                {icon !== undefined && (
                    <PixelIcon
                        name={icon}
                        size={buttonIconSizes[scale]}
                        color={buttonIconColors[tone]}
                    />
                )}
                {children}
            </PressBounce>
        </TextClassContext.Provider>
    )
}

export { Button }
export type { ButtonProps }
