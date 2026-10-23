import { TextInput } from "react-native"
import type { TextInputProps } from "react-native"

import { THEME_COLORS } from "@/lib/theme/theme-tokens"
import { cn } from "@/lib/utils/class-names"

import { inputDisabledStyles, inputStyles } from "./input.styles"

const Input = ({
    className,
    ...props
}: TextInputProps & React.RefAttributes<TextInput>) => (
    <TextInput
        className={cn(
            inputStyles,
            props.editable === false && inputDisabledStyles,
            className,
        )}
        selectionColor={THEME_COLORS.live}
        cursorColor={THEME_COLORS.live}
        {...props}
    />
)

export { Input }
