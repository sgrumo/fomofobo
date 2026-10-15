import type { Select, StrictOmit } from "shared/types"

import type { InputProps } from "../input/input"
import { Input } from "../input/input"

interface StringInputProps extends StrictOmit<InputProps, "type"> {
    type?: Select<InputProps["type"], "text" | "email" | "url">
    value: string | undefined
    onValueChange: (value: string | undefined) => void
    error?: boolean | undefined
}
export const StringInput = ({
    type = "text",
    value: propValue,
    onValueChange,
    onChange: propOnChange,
    ...props
}: StringInputProps) => {
    const value = propValue ?? ""
    const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        propOnChange?.(event)
        onValueChange(event.target.value === "" ? undefined : event.target.value)
    }

    return <Input type={type} value={value} onChange={onChange} {...props} />
}
