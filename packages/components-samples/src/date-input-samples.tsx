import { useState } from "react"
import { DateInput } from "ui-components/date-input"
import { Field } from "ui-components/field"

export const DateInputSamples = () => {
    const [customValue, setCustomValue] = useState<Date | undefined>(undefined)
    const [nativeValue, setNativeValue] = useState<Date | undefined>(undefined)

    return (
        <div className="flex max-w-[18rem] flex-col gap-4">
            <Field label="Custom Date" required={false}>
                <DateInput
                    mode="custom"
                    value={customValue}
                    onValueChange={setCustomValue}
                    className="w-full"
                />
            </Field>
            <Field label="Native Date" required={false}>
                <DateInput
                    mode="native"
                    value={nativeValue}
                    onValueChange={setNativeValue}
                    className="w-full"
                />
            </Field>
        </div>
    )
}
