import { PIXEL_CIRCLE_PROFILES } from "domain/pixel-shapes"
import type { PixelCircleSize } from "domain/pixel-shapes"
import type { ReactNode } from "react"
import { View } from "react-native"

import { PixelShape } from "@/components/ui/pixel-shape/pixel-shape"
import type { HardShadowSize } from "@/lib/theme/hard-shadow"
import type { ThemeColor } from "@/lib/theme/theme-tokens"
import { cn } from "@/lib/utils/class-names"

import { pixelCircleSizeStyles, pixelCircleStyles } from "./pixel-circle.styles"

interface PixelCircleProps {
    size: PixelCircleSize
    fill?: ThemeColor
    ink?: ThemeColor
    shadow?: HardShadowSize
    dashed?: boolean
    className?: string
    children?: ReactNode
}

const PixelCircle = (props: PixelCircleProps) => (
    <View
        className={cn(
            pixelCircleStyles,
            pixelCircleSizeStyles[props.size],
            props.className,
        )}
    >
        <PixelShape
            width={props.size}
            height={props.size}
            profile={PIXEL_CIRCLE_PROFILES[props.size]}
            fill={props.fill ?? "surface"}
            ink={props.ink ?? "line"}
            shadow={props.shadow}
            dashed={props.dashed}
        />
        {props.children}
    </View>
)

export { PixelCircle }
export type { PixelCircleProps }
