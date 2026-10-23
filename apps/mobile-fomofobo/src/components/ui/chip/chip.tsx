import type { PixelIconName } from "domain/pixel-icons"
import type { ReactNode } from "react"
import { Pressable, ScrollView } from "react-native"

import { PixelIcon } from "@/components/ui/pixel-icon/pixel-icon"
import { Text } from "@/components/ui/text/text"
import { hardShadow } from "@/lib/theme/hard-shadow"
import { cn } from "@/lib/utils/class-names"

import {
    CHIP_HIT_SLOP,
    CHIP_ICON_SIZE,
    chipCountVariants,
    chipLabelVariants,
    chipRowStyles,
    chipVariants,
} from "./chip.styles"

interface ChipRowProps {
    label: string
    children?: ReactNode
    className?: string
}

const ChipRow = (props: ChipRowProps) => (
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

interface ChipProps {
    label: string
    pressed: boolean
    onPressedChange: (pressed: boolean) => void
    icon?: PixelIconName
    count?: number
    disabled?: boolean
}

const Chip = (props: ChipProps) => (
    <Pressable
        accessibilityRole="togglebutton"
        accessibilityLabel={
            props.count === undefined
                ? props.label
                : `${props.label} ${String(props.count)}`
        }
        accessibilityState={{ checked: props.pressed, disabled: props.disabled === true }}
        disabled={props.disabled}
        hitSlop={CHIP_HIT_SLOP}
        onPress={() => {
            props.onPressedChange(!props.pressed)
        }}
        className={cn(
            chipVariants({ pressed: props.pressed }),
            props.disabled === true && "opacity-50",
        )}
        style={hardShadow("sm")}
    >
        {props.icon !== undefined && (
            <PixelIcon
                name={props.icon}
                size={CHIP_ICON_SIZE}
                color={props.pressed ? "fg-inverse" : "fg"}
            />
        )}
        <Text
            className={chipLabelVariants({ pressed: props.pressed })}
            maxFontSizeMultiplier={1.5}
        >
            {props.label}
        </Text>
        {props.count !== undefined && (
            <Text
                className={chipCountVariants({ pressed: props.pressed })}
                maxFontSizeMultiplier={1.5}
            >
                {props.count}
            </Text>
        )}
    </Pressable>
)

export { Chip, ChipRow }
