import { noop } from "es-toolkit"
import { cn } from "frontend-shared/styles"
import { useState } from "react"
import { Field } from "ui-components/field"
import { Form } from "ui-components/form"
import { NumberInput } from "ui-components/number-input"

interface NumberInputShowcaseProps {
    className?: string
}
export const NumberInputShowcase = (props: NumberInputShowcaseProps) => {
    const [numberInputs, setNumberInputs] = useState<Partial<Record<string, number>>>({})
    const numberValue = (key: string) => numberInputs[key]
    const numberOnValueChange = (key: string) => (value: number | undefined) => {
        setNumberInputs(prev => ({
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
            <Field label="Medium Number Input" required={true}>
                <NumberInput
                    value={numberValue("n1")}
                    onValueChange={numberOnValueChange("n1")}
                    size="md"
                    className="w-full"
                />
            </Field>
            <Field label="Small Number Input" required={true}>
                <NumberInput
                    value={numberValue("n2")}
                    onValueChange={numberOnValueChange("n2")}
                    size="sm"
                    className="w-full"
                />
            </Field>
            <Field label="Medium Number Input - No Controls" required={true}>
                <NumberInput
                    value={numberValue("n3")}
                    onValueChange={numberOnValueChange("n3")}
                    controls={false}
                    size="md"
                    className="w-full"
                />
            </Field>
            <Field label="Small Number Input - No Controls" required={true}>
                <NumberInput
                    value={numberValue("n4")}
                    onValueChange={numberOnValueChange("n4")}
                    controls={false}
                    size="sm"
                    className="w-full"
                />
            </Field>
            <Field label="Medium Number Input - Step 0.1" required={true}>
                <NumberInput
                    value={numberValue("n5")}
                    onValueChange={numberOnValueChange("n5")}
                    step={0.1}
                    size="md"
                    className="w-full"
                />
            </Field>
            <Field label="Medium Number Input - Min -10" required={true}>
                <NumberInput
                    value={numberValue("n6")}
                    onValueChange={numberOnValueChange("n6")}
                    min={-10}
                    size="md"
                    className="w-full"
                />
            </Field>
            <Field label="Medium Number Input - Max 10" required={true}>
                <NumberInput
                    value={numberValue("n7")}
                    onValueChange={numberOnValueChange("n7")}
                    max={10}
                    size="md"
                    className="w-full"
                />
            </Field>
            <Field label="Medium Number Input - Min -10/Max 10" required={true}>
                <NumberInput
                    value={numberValue("n8")}
                    onValueChange={numberOnValueChange("n8")}
                    min={-10}
                    max={10}
                    size="md"
                    className="w-full"
                />
            </Field>
            <Field
                label="With Description"
                description="Pick the number of seats to reserve."
                required={true}
            >
                <NumberInput
                    value={numberValue("n9")}
                    onValueChange={numberOnValueChange("n9")}
                    size="md"
                    className="w-full"
                />
            </Field>
        </Form>
    )
}
