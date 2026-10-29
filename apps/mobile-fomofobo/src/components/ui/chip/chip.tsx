import type { PixelIconName } from "domain/pixel-icons"
import { createContext, useContext } from "react"
import type { ReactNode } from "react"
import { Pressable, ScrollView, View } from "react-native"

import { PixelIcon } from "@/components/ui/pixel-icon/pixel-icon"
import { Text } from "@/components/ui/text/text"
import { hardShadow } from "@/lib/theme/hard-shadow"
import { cn } from "@/lib/utils/class-names"

import {
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

const Chip = (props: ChipProps) => {
    const inBar = useContext(ChipBarContext)
    const tone = props.tone ?? "inverse"
    const inverse = props.pressed && tone === "inverse"

    return (
        <Pressable
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
            className={cn(
                chipVariants({ pressed: props.pressed, tone, inBar }),
                props.grow === true && "grow justify-center",
                props.disabled === true && "opacity-50",
            )}
            style={inBar ? undefined : hardShadow("sm")}
        >
            {props.icon !== undefined && (
                <PixelIcon
                    name={props.icon}
                    size={CHIP_ICON_SIZE}
                    color={inverse ? "fg-inverse" : "fg"}
                />
            )}
            <Text className={chipLabelVariants({ inverse })} maxFontSizeMultiplier={1.5}>
                {props.label}
            </Text>
            {props.count !== undefined && (
                <Text
                    className={chipCountVariants({
                        pressed: props.pressed,
                        inverseTone: tone === "inverse",
                    })}
                    maxFontSizeMultiplier={1.5}
                >
                    {props.count}
                </Text>
            )}
        </Pressable>
    )
}

export { Chip, ChipBar, ChipRow }
export type { ChipTone }
