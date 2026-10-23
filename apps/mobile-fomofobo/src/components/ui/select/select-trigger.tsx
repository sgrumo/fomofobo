import { ChevronDown } from "lucide-react-native"
import { Pressable } from "react-native"

import { Text } from "@/components/ui/text/text"
import { THEME_COLORS } from "@/lib/theme/theme-tokens"
import { cn } from "@/lib/utils/class-names"

import {
    SELECT_CHEVRON_SIZE,
    selectPlaceholderStyles,
    selectTriggerStyles,
    selectValueStyles,
} from "./select.styles"

interface SelectTriggerProps {
    label: string
    value?: string
    placeholder: string
    expanded: boolean
    disabled?: boolean
    onPress: () => void
    className?: string
}

const SelectTrigger = (props: SelectTriggerProps) => (
    <Pressable
        role="combobox"
        aria-expanded={props.expanded}
        accessibilityLabel={props.label}
        accessibilityValue={{ text: props.value ?? props.placeholder }}
        disabled={props.disabled}
        onPress={props.onPress}
        className={cn(
            selectTriggerStyles,
            props.disabled === true && "opacity-50",
            props.className,
        )}
    >
        <Text
            numberOfLines={1}
            className={
                props.value === undefined ? selectPlaceholderStyles : selectValueStyles
            }
        >
            {props.value ?? props.placeholder}
        </Text>
        <ChevronDown size={SELECT_CHEVRON_SIZE} color={THEME_COLORS.fg} />
    </Pressable>
)

export { SelectTrigger }
