import { noop } from "es-toolkit"
import { useState } from "react"
import type { Time } from "shared/temporal"
import { Field } from "ui-components/field"
import { Form } from "ui-components/form"
import { TimeInput } from "ui-components/time-input"

export const TimeInputShowcase = () => {
    const [timeInputs, setTimeInputs] = useState<Partial<Record<string, Time>>>({})
    const timeValue = (key: string) => timeInputs[key]
    const timeOnValueChange = (key: string) => (value: Time | undefined) => {
        setTimeInputs(prev => ({
            ...prev,
            [key]: value,
        }))
    }

    return (
        <Form
            noValidate={false}
            mode="edit"
            onSubmit={noop}
            className="grid w-full grid-cols-[repeat(auto-fit,minmax(min(100%,18rem),18rem))] justify-center gap-4"
        >
            <Field label="Time Input" required={true}>
                <TimeInput
                    value={timeValue("t1")}
                    onValueChange={timeOnValueChange("t1")}
                    className="w-full"
                />
            </Field>
            <Field label="Time Input - Error" required={true}>
                <TimeInput
                    value={timeValue("t2")}
                    onValueChange={timeOnValueChange("t2")}
                    error={true}
                    className="w-full"
                />
            </Field>
            <Field label="Time Input - Disabled" disabled={true} required={true}>
                <TimeInput
                    value={timeValue("t3")}
                    onValueChange={timeOnValueChange("t3")}
                    className="w-full"
                />
            </Field>
            <Field
                label="With Description"
                description="Choose the time the report should be sent each day."
                required={true}
            >
                <TimeInput
                    value={timeValue("t4")}
                    onValueChange={timeOnValueChange("t4")}
                    className="w-full"
                />
            </Field>
        </Form>
    )
}
