import { capitalize } from "es-toolkit"
import { useState } from "react"
import { Field } from "ui-components/field"
import { RadioGroup } from "ui-components/radio"
import { z } from "zod"

type Fruit = "apple" | "banana" | "cherry"
const fruitSchema = z.enum(["apple", "banana", "cherry"])
const fruits: Fruit[] = ["apple", "banana", "cherry"]

export const RadioShowcase = () => {
    const [valueSm, setValueSm] = useState<Fruit | undefined>(undefined)
    const [valueMd, setValueMd] = useState<Fruit | undefined>("banana")
    const [disabledValue, setDisabledValue] = useState<Fruit | undefined>("banana")
    const [describedValue, setDescribedValue] = useState<Fruit | undefined>(undefined)

    return (
        <div className="flex flex-col gap-4">
            <p className="tp-h4-medium">Radio Group</p>
            <div className="flex flex-wrap gap-8">
                <Field label="Fruits (sm)" required={false}>
                    <RadioGroup
                        itemSchema={fruitSchema}
                        items={fruits}
                        getItemLabel={capitalize}
                        value={valueSm}
                        onValueChange={setValueSm}
                        size="sm"
                    />
                </Field>
                <Field label="Fruits (md)" required={false}>
                    <RadioGroup
                        itemSchema={fruitSchema}
                        items={fruits}
                        getItemLabel={capitalize}
                        value={valueMd}
                        onValueChange={setValueMd}
                        size="md"
                    />
                </Field>
                <Field label="Fruits (disabled)" disabled={true} required={false}>
                    <RadioGroup
                        itemSchema={fruitSchema}
                        items={fruits}
                        getItemLabel={capitalize}
                        value={disabledValue}
                        onValueChange={setDisabledValue}
                    />
                </Field>
                <Field
                    label="Fruits (with description)"
                    description="Choose the one fruit to feature on the homepage."
                    required={false}
                >
                    <RadioGroup
                        itemSchema={fruitSchema}
                        items={fruits}
                        getItemLabel={capitalize}
                        value={describedValue}
                        onValueChange={setDescribedValue}
                    />
                </Field>
            </div>
        </div>
    )
}
