import { Pressable, View } from "react-native"

import { Text } from "@/components/ui/text/text"
import { cn } from "@/lib/utils/class-names"

import {
    radioCircleActiveStyles,
    radioCircleStyles,
    radioDotStyles,
    radioGroupStyles,
    radioItemStyles,
    radioLabelStyles,
} from "./radio-group.styles"

interface RadioOption {
    label: string
    value: string
}

interface RadioGroupProps {
    value: string | undefined
    onValueChange: (value: string) => void
    options: readonly RadioOption[]
    disabled?: boolean
    className?: string
    accessibilityLabel?: string
}

const RadioGroup = (props: RadioGroupProps) => (
    <View
        role="radiogroup"
        accessibilityLabel={props.accessibilityLabel}
        className={cn(radioGroupStyles, props.className)}
    >
        {props.options.map(option => {
            const selected = props.value === option.value
            return (
                <Pressable
                    key={option.value}
                    role="radio"
                    aria-checked={selected}
                    accessibilityLabel={option.label}
                    disabled={props.disabled}
                    onPress={() => {
                        props.onValueChange(option.value)
                    }}
                    className={cn(radioItemStyles, props.disabled && "opacity-50")}
                >
                    <View
                        className={cn(
                            radioCircleStyles,
                            selected && radioCircleActiveStyles,
                        )}
                    >
                        {selected && <View className={radioDotStyles} />}
                    </View>
                    <Text className={radioLabelStyles}>{option.label}</Text>
                </Pressable>
            )
        })}
    </View>
)

export { RadioGroup }
export type { RadioOption }
