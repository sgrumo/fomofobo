import { noop } from "es-toolkit"
import { useState } from "react"
import { Field } from "ui-components/field"
import { OtpInput } from "ui-components/otp-input"

export const OtpInputSamples = () => {
    const [value, setValue] = useState<string | undefined>(undefined)
    const [groupedValue, setGroupedValue] = useState<string | undefined>(undefined)
    const [maskedValue, setMaskedValue] = useState<string | undefined>(undefined)
    const [completed, setCompleted] = useState<string | undefined>(undefined)

    return (
        <div className="flex flex-col gap-4">
            <Field label="Sample OTP Input" required={false}>
                <OtpInput
                    length={4}
                    value={value}
                    onValueChange={setValue}
                    onValueComplete={setCompleted}
                />
            </Field>
            <p>OTP completed: {completed ?? "none"}</p>
            <Field label="Grouped OTP Input" required={false}>
                <OtpInput
                    length={6}
                    groupSize={3}
                    value={groupedValue}
                    onValueChange={setGroupedValue}
                />
            </Field>
            <Field label="Masked OTP Input" required={false}>
                <OtpInput
                    length={4}
                    mask={true}
                    value={maskedValue}
                    onValueChange={setMaskedValue}
                />
            </Field>
            <Field label="Disabled OTP Input" disabled={true} required={false}>
                <OtpInput length={4} value="1234" onValueChange={noop} />
            </Field>
        </div>
    )
}
