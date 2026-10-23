import { Pressable, View } from "react-native"

import { cn } from "@/lib/utils/class-names"

import {
    switchThumbActiveStyles,
    switchThumbInactiveStyles,
    switchThumbStyles,
    switchTrackActiveStyles,
    switchTrackInactiveStyles,
    switchTrackStyles,
} from "./switch.styles"

interface SwitchProps {
    checked: boolean
    onToggle: () => void
    disabled?: boolean
    accessibilityLabel?: string
}

const Switch = (props: SwitchProps) => (
    <Pressable
        role="switch"
        aria-checked={props.checked}
        accessibilityLabel={props.accessibilityLabel}
        disabled={props.disabled}
        onPress={props.onToggle}
        className={cn(
            switchTrackStyles,
            props.checked ? switchTrackActiveStyles : switchTrackInactiveStyles,
            props.disabled && "opacity-50",
        )}
    >
        <View
            className={cn(
                switchThumbStyles,
                props.checked ? switchThumbActiveStyles : switchThumbInactiveStyles,
            )}
        />
    </Pressable>
)

export { Switch }
