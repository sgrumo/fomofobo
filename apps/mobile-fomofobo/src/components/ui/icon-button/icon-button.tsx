import type { PixelIconName } from "domain/pixel-icons"
import { useState } from "react"
import { Pressable, View } from "react-native"

import { PixelCircle } from "@/components/ui/pixel-circle/pixel-circle"
import { PixelIcon } from "@/components/ui/pixel-icon/pixel-icon"
import { cn } from "@/lib/utils/class-names"

import {
    ICON_BUTTON_TARGET,
    iconButtonMirroredStyles,
    iconButtonPressedStyle,
    iconButtonSizes,
    iconButtonTones,
} from "./icon-button.styles"

interface IconButtonProps {
    icon: PixelIconName
    label: string
    onPress: () => void
    size?: keyof typeof iconButtonSizes
    tone?: keyof typeof iconButtonTones
    // Flips the icon left to right, for a forward arrow drawn from `back`
    mirrored?: boolean
    disabled?: boolean
    expanded?: boolean
    selected?: boolean
    className?: string
}

const IconButton = (props: IconButtonProps) => {
    const [pressed, setPressed] = useState(false)
    const size = iconButtonSizes[props.size ?? "md"]
    const tone = iconButtonTones[props.tone ?? "surface"]

    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={props.label}
            accessibilityState={{
                disabled: props.disabled === true,
                expanded: props.expanded,
                selected: props.selected,
            }}
            disabled={props.disabled}
            hitSlop={Math.max(0, (ICON_BUTTON_TARGET - size.circle) / 2)}
            onPress={props.onPress}
            className={cn(props.disabled === true && "opacity-50", props.className)}
            onPressIn={() => {
                setPressed(true)
            }}
            onPressOut={() => {
                setPressed(false)
            }}
            style={pressed ? iconButtonPressedStyle : undefined}
        >
            <PixelCircle
                size={size.circle}
                fill={tone.fill}
                shadow={pressed || props.disabled === true ? "sm" : "md"}
            >
                <View
                    className={
                        props.mirrored === true ? iconButtonMirroredStyles : undefined
                    }
                >
                    <PixelIcon
                        name={props.icon}
                        size={size.icon}
                        color={tone.icon}
                        centered={true}
                    />
                </View>
            </PixelCircle>
        </Pressable>
    )
}

export { IconButton }
