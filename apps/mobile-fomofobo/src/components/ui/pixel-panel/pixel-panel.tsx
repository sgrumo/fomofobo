import { useState } from "react"
import type { ReactNode } from "react"
import { View } from "react-native"

import { PixelShape } from "@/components/ui/pixel-shape/pixel-shape"
import { PIXEL_CORNER_PROFILE } from "@/lib/pixel/pixel-shapes"
import type { HardShadowSize } from "@/lib/theme/hard-shadow"
import type { ThemeColor } from "@/lib/theme/theme-tokens"
import { cn } from "@/lib/utils/class-names"

import { pixelPanelStyles } from "./pixel-panel.styles"

interface PixelPanelProps {
    fill?: ThemeColor
    ink?: ThemeColor
    shadow?: HardShadowSize
    className?: string
    children?: ReactNode
}

interface PanelBox {
    width: number
    height: number
}

const PixelPanel = (props: PixelPanelProps) => {
    const [box, setBox] = useState<PanelBox>()

    return (
        <View
            className={cn(pixelPanelStyles, props.className)}
            onLayout={event => {
                setBox({
                    width: Math.round(event.nativeEvent.layout.width),
                    height: Math.round(event.nativeEvent.layout.height),
                })
            }}
        >
            {box !== undefined && (
                <PixelShape
                    width={box.width}
                    height={box.height}
                    profile={PIXEL_CORNER_PROFILE}
                    fill={props.fill ?? "surface"}
                    ink={props.ink ?? "line"}
                    shadow={props.shadow}
                />
            )}
            {props.children}
        </View>
    )
}

export { PixelPanel }
export type { PixelPanelProps }
