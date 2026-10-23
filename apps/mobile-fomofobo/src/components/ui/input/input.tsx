import { TextInput } from "react-native"
import type { TextInputProps } from "react-native"

import { cn } from "@/lib/utils/class-names"

import { inputBaseStyles, inputDisabledStyles, inputWebStyles } from "./input.styles"

const Input = ({
    className,
    ...props
}: TextInputProps & React.RefAttributes<TextInput>) => (
    <TextInput
        className={cn(
            inputBaseStyles,
            props.editable === false && inputDisabledStyles,
            inputWebStyles,
            className,
        )}
        {...props}
    />
)

export { Input }
