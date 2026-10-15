import { noop } from "es-toolkit"
import { useState } from "react"
import type { Time } from "shared/temporal"
import { Field } from "ui-components/field"
import { NumberInput } from "ui-components/number-input"
import { PasswordInput } from "ui-components/password-input"
import { StringInput } from "ui-components/string-input"
import { Textarea } from "ui-components/textarea"
import { TimeInput } from "ui-components/time-input"

export const InputSamples = () => {
    const [stringValue, setStringValue] = useState<string | undefined>(undefined)
    const [bareValue, setBareValue] = useState<string | undefined>(undefined)
    const [textareaValue, setTextareaValue] = useState<string | undefined>(undefined)
    const [timeValue, setTimeValue] = useState<Time | undefined>(undefined)
    const [passwordValue, setPasswordValue] = useState<string | undefined>(undefined)
    const [numberValue, setNumberValue] = useState<number | undefined>(undefined)
    const [signedValue, setSignedValue] = useState<number | undefined>(undefined)

    return (
        <div className="flex max-w-[18rem] flex-col gap-4">
            <Field label="Sample String Input" required={false}>
                <StringInput
                    value={stringValue}
                    onValueChange={setStringValue}
                    placeholder="Sample string placeholder"
                    className="w-full"
                />
            </Field>
            <StringInput
                value={bareValue}
                onValueChange={setBareValue}
                placeholder="Placeholder Only Input"
                className="w-full"
            />
            <Field label="Disabled Input" disabled={true} required={false}>
                <StringInput
                    value="Disabled input value"
                    onValueChange={noop}
                    className="w-full"
                />
            </Field>
            <Field label="Sample Textarea" required={false}>
                <Textarea
                    value={textareaValue}
                    onValueChange={setTextareaValue}
                    className="w-full"
                />
            </Field>
            <Field label="Sample Time Input" required={false}>
                <TimeInput
                    value={timeValue}
                    onValueChange={setTimeValue}
                    className="w-full"
                />
            </Field>
            <Field label="Sample Password" required={false}>
                <PasswordInput
                    value={passwordValue}
                    onValueChange={setPasswordValue}
                    autoComplete="new-password"
                    className="w-full"
                />
            </Field>
            <Field label="Sample Number" required={false}>
                <NumberInput
                    value={numberValue}
                    onValueChange={setNumberValue}
                    size="md"
                    min={0}
                    max={100}
                    step={1}
                    className="w-full"
                />
            </Field>
            <Field label="Sample Signed Number" required={false}>
                <NumberInput
                    value={signedValue}
                    onValueChange={setSignedValue}
                    size="md"
                    step={1}
                    className="w-full"
                />
            </Field>
        </div>
    )
}
