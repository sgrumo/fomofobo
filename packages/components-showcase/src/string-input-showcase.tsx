import { noop } from "es-toolkit"
import { cn } from "frontend-shared/styles"
import { useState } from "react"
import { Field } from "ui-components/field"
import { Form } from "ui-components/form"
import { IconCalendar } from "ui-components/icons"
import { StringInput } from "ui-components/string-input"

interface StringInputShowcaseProps {
    className?: string
}
export const StringInputShowcase = (props: StringInputShowcaseProps) => {
    const [textInputs, setTextInputs] = useState<Partial<Record<string, string>>>({})
    const textValue = (key: string) => textInputs[key]
    const textOnValueChange = (key: string) => (value: string | undefined) => {
        setTextInputs(prev => ({
            ...prev,
            [key]: value,
        }))
    }

    return (
        <Form
            noValidate={false}
            mode="edit"
            onSubmit={noop}
            className={cn(
                "grid w-full grid-cols-[repeat(auto-fit,minmax(min(100%,18rem),18rem))] justify-center gap-4",
                props.className,
            )}
        >
            <Field label="Medium String Input" required={true}>
                <StringInput
                    value={textValue("t1")}
                    onValueChange={textOnValueChange("t1")}
                    size="md"
                    className="w-full"
                />
            </Field>
            <Field label="Small String Input" required={true}>
                <StringInput
                    value={textValue("t2")}
                    onValueChange={textOnValueChange("t2")}
                    size="sm"
                    className="w-full"
                />
            </Field>
            <Field label="String Input Icon" required={true}>
                <StringInput
                    value={textValue("t3")}
                    onValueChange={textOnValueChange("t3")}
                    icon={<IconCalendar />}
                    className="w-full"
                />
            </Field>
            <Field label="Small String Input Icon" required={true}>
                <StringInput
                    value={textValue("t4")}
                    onValueChange={textOnValueChange("t4")}
                    size="sm"
                    icon={<IconCalendar />}
                    className="w-full"
                />
            </Field>
            <Field label="String Input Prefix" required={true}>
                <StringInput
                    value={textValue("t5")}
                    onValueChange={textOnValueChange("t5")}
                    prefix="www."
                    className="w-full"
                />
            </Field>
            <Field label="Small String Input Prefix" required={true}>
                <StringInput
                    value={textValue("t6")}
                    onValueChange={textOnValueChange("t6")}
                    prefix="www."
                    size="sm"
                    className="w-full"
                />
            </Field>
            <Field label="String Input Suffix" required={true}>
                <StringInput
                    value={textValue("t7")}
                    onValueChange={textOnValueChange("t7")}
                    suffix=".com"
                    className="w-full"
                />
            </Field>
            <Field label="Small String Input Suffix" required={true}>
                <StringInput
                    value={textValue("t8")}
                    onValueChange={textOnValueChange("t8")}
                    suffix=".com"
                    size="sm"
                    className="w-full"
                />
            </Field>
            <Field label="String Input Prefix & Suffix" required={true}>
                <StringInput
                    value={textValue("t9")}
                    onValueChange={textOnValueChange("t9")}
                    prefix="www."
                    suffix=".com"
                    className="w-full"
                />
            </Field>
            <Field label="Small String Input Prefix & Suffix" required={true}>
                <StringInput
                    value={textValue("t10")}
                    onValueChange={textOnValueChange("t10")}
                    prefix="www."
                    suffix=".com"
                    size="sm"
                    className="w-full"
                />
            </Field>
            <Field
                label="With Description"
                description="This help text shows in a tooltip when you hover or focus the info icon next to the label."
                required={true}
            >
                <StringInput
                    value={textValue("t11")}
                    onValueChange={textOnValueChange("t11")}
                    className="w-full"
                />
            </Field>
            <Field
                label="Optional With Description"
                description="Descriptions also work without the required marker."
                required={false}
            >
                <StringInput
                    value={textValue("t12")}
                    onValueChange={textOnValueChange("t12")}
                    className="w-full"
                />
            </Field>
        </Form>
    )
}
