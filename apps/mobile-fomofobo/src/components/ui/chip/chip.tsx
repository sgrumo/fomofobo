import type { PixelIconName } from "domain/pixel-icons"
import { PIXEL_CORNER_PROFILE } from "domain/pixel-shapes"
import { createContext, useContext, useState } from "react"
import type { ReactNode } from "react"
import { ScrollView, View } from "react-native"

import { PixelIcon } from "@/components/ui/pixel-icon/pixel-icon"
import { PixelShape } from "@/components/ui/pixel-shape/pixel-shape"
import { PressBounce } from "@/components/ui/press-bounce/press-bounce"
import { Text } from "@/components/ui/text/text"
import { COMPACT_MAX_FONT_SCALE } from "@/lib/theme/font-scale"
import { hardShadow } from "@/lib/theme/hard-shadow"
import { cn } from "@/lib/utils/class-names"

import {
    CHIP_BOUNCE,
    CHIP_HIT_SLOP,
    CHIP_ICON_SIZE,
    chipBarStyles,
    chipBarTrackStyles,
    chipCountVariants,
    chipLabelVariants,
    chipRowStyles,
    chipRowWrapStyles,
    chipVariants,
} from "./chip.styles"

interface ChipRowProps {
    label: string
    // Wraps the chips onto more lines instead of scrolling them sideways
    wrap?: boolean
    children?: ReactNode
    className?: string
}

const ChipRow = (props: ChipRowProps) =>
    props.wrap === true ? (
        <View
            role="group"
            accessibilityLabel={props.label}
            className={cn(chipRowStyles, chipRowWrapStyles, props.className)}
        >
            {props.children}
        </View>
    ) : (
        <ScrollView
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            role="group"
            accessibilityLabel={props.label}
            contentContainerClassName={cn(chipRowStyles, props.className)}
        >
            {props.children}
        </ScrollView>
    )

// True for a chip inside a `ChipBar`
const ChipBarContext = createContext(false)

interface ChipBarProps {
    label: string
    children?: ReactNode
}

const ChipBar = (props: ChipBarProps) => (
    <View
        role="group"
        accessibilityLabel={props.label}
        className={chipBarStyles}
        style={hardShadow("sm")}
    >
        <View className={chipBarTrackStyles}>
            <ChipBarContext.Provider value={true}>
                {props.children}
            </ChipBarContext.Provider>
        </View>
    </View>
)

type ChipTone = "inverse" | "live" | "upcoming" | "ended" | "permanent"

interface ChipProps {
    label: string
    pressed: boolean
    onPressedChange: (pressed: boolean) => void
    icon?: PixelIconName
    count?: number
    tone?: ChipTone
    // Shares the width of its row with the other growing chips
    grow?: boolean
    disabled?: boolean
}

interface ChipBox {
    width: number
    height: number
}

const Chip = (props: ChipProps) => {
    const inBar = useContext(ChipBarContext)
    const tone = props.tone ?? "inverse"
    const inverse = props.pressed && tone === "inverse"
    const pixelTone = inBar || tone === "inverse" ? undefined : tone
    const [box, setBox] = useState<ChipBox>()

    return (
        <PressBounce
            accessibilityRole="togglebutton"
            accessibilityLabel={
                props.count === undefined
                    ? props.label
                    : `${props.label} ${String(props.count)}`
            }
            accessibilityState={{
                checked: props.pressed,
                disabled: props.disabled === true,
            }}
            disabled={props.disabled}
            hitSlop={CHIP_HIT_SLOP}
            onPress={() => {
                props.onPressedChange(!props.pressed)
            }}
            onLayout={
                pixelTone === undefined
                    ? undefined
                    : event => {
                          setBox({
                              width: Math.round(event.nativeEvent.layout.width),
                              height: Math.round(event.nativeEvent.layout.height),
                          })
                      }
            }
            className={cn(
                chipVariants({
                    pressed: props.pressed,
                    inverseTone: tone === "inverse",
                    shape: inBar ? "bar" : pixelTone === undefined ? "rounded" : "pixel",
                }),
                props.grow === true && "grow justify-center",
                props.disabled === true && "opacity-50",
            )}
            bounce={CHIP_BOUNCE}
            styleOf={() =>
                inBar || pixelTone !== undefined ? undefined : hardShadow("sm")
            }
        >
            {pixelTone !== undefined && box !== undefined && (
                <PixelShape
                    width={box.width}
                    height={box.height}
                    profile={PIXEL_CORNER_PROFILE}
                    fill={props.pressed ? pixelTone : `${pixelTone}-on-map`}
                    ink="line"
                    shadow="sm"
                />
            )}
            {props.icon !== undefined && (
                <PixelIcon
                    name={props.icon}
                    size={CHIP_ICON_SIZE}
                    color={inverse ? "fg-inverse" : "fg"}
                />
            )}
            <Text
                className={chipLabelVariants({ inverse })}
                maxFontSizeMultiplier={COMPACT_MAX_FONT_SCALE}
            >
                {props.label}
            </Text>
            {props.count !== undefined && (
                <Text
                    className={chipCountVariants({
                        pressed: props.pressed,
                        inverseTone: tone === "inverse",
                    })}
                    maxFontSizeMultiplier={COMPACT_MAX_FONT_SCALE}
                >
                    {props.count}
                </Text>
            )}
        </PressBounce>
    )
}

export { Chip, ChipBar, ChipRow }
export type { ChipTone }
