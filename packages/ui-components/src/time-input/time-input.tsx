import type { ChangeEvent } from "react"
import { isoTime, timeFromString } from "shared/temporal"
import type { Time } from "shared/temporal"
import type { StrictOmit } from "shared/types"
import { isDefined } from "shared/values"

import { Input } from "../input/input"
import type { InputProps } from "../input/input"

// TODO use Temporal.PlainTime once widely available - https://caniuse.com/temporal
interface TimeInputProps extends StrictOmit<InputProps, "value" | "onChange" | "type"> {
    value: Time | undefined
    onValueChange: (value: Time | undefined) => void
    error?: boolean | undefined
}
export const TimeInput = ({
    value: propValue,
    onValueChange,
    ...props
}: TimeInputProps) => {
    const value = isDefined(propValue) ? isoTime(propValue) : ""
    const onChange = (event: ChangeEvent<HTMLInputElement>) => {
        const newValueRaw = event.target.value
        if (newValueRaw.length === 0) {
            onValueChange(undefined)
            return
        }

        onValueChange(timeFromString(newValueRaw))
    }

    return <Input type="time" value={value} onChange={onChange} {...props} />
}
