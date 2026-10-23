import { Check } from "lucide-react-native"
import { Pressable } from "react-native"

import { Text } from "@/components/ui/text/text"
import { THEME_COLORS } from "@/lib/theme/theme-tokens"

import {
    SELECT_CHECK_SIZE,
    selectOptionTextStyles,
    selectOptionVariants,
} from "./select.styles"

interface SelectOptionProps {
    label: string
    selected: boolean
    onPress: () => void
}

const SelectOption = (props: SelectOptionProps) => (
    <Pressable
        role="option"
        aria-selected={props.selected}
        accessibilityLabel={props.label}
        onPress={props.onPress}
        className={selectOptionVariants({ selected: props.selected })}
    >
        <Text className={selectOptionTextStyles}>{props.label}</Text>
        {props.selected && <Check size={SELECT_CHECK_SIZE} color={THEME_COLORS.fg} />}
    </Pressable>
)

export { SelectOption }
