import { Pressable } from "react-native"

import { Text } from "@/components/ui/text/text"
import { cn } from "@/lib/utils/class-names"

import { checkboxCheckedStyles, checkboxStyles, checkmarkStyles } from "./checkbox.styles"

interface CheckboxProps {
    checked: boolean
    onToggle: () => void
    accessibilityLabel?: string
}

export const Checkbox = (props: CheckboxProps) => (
    <Pressable
        role="checkbox"
        aria-checked={props.checked}
        accessibilityLabel={props.accessibilityLabel}
        onPress={props.onToggle}
        className={cn(checkboxStyles, props.checked && checkboxCheckedStyles)}
    >
        {props.checked && <Text className={checkmarkStyles}>✓</Text>}
    </Pressable>
)
