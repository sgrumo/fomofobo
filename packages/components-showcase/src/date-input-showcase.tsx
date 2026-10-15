import { addDays, endOfYear, startOfYear, subDays } from "date-fns"
import { noop } from "es-toolkit"
import { useState } from "react"
import { DateInput } from "ui-components/date-input"
import { Field } from "ui-components/field"
import { Form } from "ui-components/form"

const today = new Date()
const minDate = addDays(startOfYear(today), 7)
const maxDate = subDays(endOfYear(today), 7)
/**
 * @description True when the day of the month is even
 * @param date Date read
 */
const isEvenDay = (date: Date) => date.getDate() % 2 === 0

export const DateInputShowcase = () => {
    const [dateInputs, setDateInputs] = useState<Partial<Record<string, Date>>>({})
    const dateValue = (key: string) => dateInputs[key]
    const dateOnValueChange = (key: string) => (value: Date | undefined) => {
        setDateInputs(prev => ({
            ...prev,
            [key]: value,
        }))
    }

    return (
        <Form
            mode="edit"
            onSubmit={noop}
            className="flex w-full flex-col gap-8"
            noValidate={false}
        >
            <div className="flex flex-col gap-4">
                <p className="tp-pixel-lg">Custom</p>
                <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,18rem),18rem))] justify-center gap-4">
                    <Field label="Default" required={true}>
                        <DateInput
                            mode="custom"
                            value={dateValue("c1")}
                            onValueChange={dateOnValueChange("c1")}
                            className="w-full"
                        />
                    </Field>
                    <Field label="Error" required={true}>
                        <DateInput
                            mode="custom"
                            value={dateValue("c2")}
                            onValueChange={dateOnValueChange("c2")}
                            error={true}
                            className="w-full"
                        />
                    </Field>
                    <Field label="Disabled" disabled={true} required={true}>
                        <DateInput
                            mode="custom"
                            value={dateValue("c3")}
                            onValueChange={dateOnValueChange("c3")}
                            className="w-full"
                        />
                    </Field>
                    <Field label="Min / Max" required={true}>
                        <DateInput
                            mode="custom"
                            value={dateValue("c4")}
                            onValueChange={dateOnValueChange("c4")}
                            min={minDate}
                            max={maxDate}
                            className="w-full"
                        />
                    </Field>
                    <Field label="Even days disabled" required={true}>
                        <DateInput
                            mode="custom"
                            value={dateValue("c5")}
                            onValueChange={dateOnValueChange("c5")}
                            isDayDisabled={isEvenDay}
                            className="w-full"
                        />
                    </Field>
                    <Field
                        label="With Description"
                        description="Pick the date the contract becomes effective."
                        required={true}
                    >
                        <DateInput
                            mode="custom"
                            value={dateValue("c6")}
                            onValueChange={dateOnValueChange("c6")}
                            className="w-full"
                        />
                    </Field>
                </div>
            </div>
            <div className="flex flex-col gap-4">
                <p className="tp-pixel-lg">Native</p>
                <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,18rem),18rem))] justify-center gap-4">
                    <Field label="Default" required={true}>
                        <DateInput
                            mode="native"
                            value={dateValue("n1")}
                            onValueChange={dateOnValueChange("n1")}
                            className="w-full"
                        />
                    </Field>
                    <Field label="Error" required={true}>
                        <DateInput
                            mode="native"
                            value={dateValue("n2")}
                            onValueChange={dateOnValueChange("n2")}
                            error={true}
                            className="w-full"
                        />
                    </Field>
                    <Field label="Disabled" disabled={true} required={true}>
                        <DateInput
                            mode="native"
                            value={dateValue("n3")}
                            onValueChange={dateOnValueChange("n3")}
                            className="w-full"
                        />
                    </Field>
                    <Field label="Min / Max" required={true}>
                        <DateInput
                            mode="native"
                            value={dateValue("n4")}
                            onValueChange={dateOnValueChange("n4")}
                            min={minDate}
                            max={maxDate}
                            className="w-full"
                        />
                    </Field>
                    <Field
                        label="Field-context error"
                        errors={["Invalid date"]}
                        required={true}
                    >
                        <DateInput
                            mode="native"
                            value={dateValue("n5")}
                            onValueChange={dateOnValueChange("n5")}
                            className="w-full"
                        />
                    </Field>
                    <Field
                        label="With Description"
                        description="Pick the date the contract becomes effective."
                        required={true}
                    >
                        <DateInput
                            mode="native"
                            value={dateValue("n6")}
                            onValueChange={dateOnValueChange("n6")}
                            className="w-full"
                        />
                    </Field>
                </div>
            </div>
        </Form>
    )
}
