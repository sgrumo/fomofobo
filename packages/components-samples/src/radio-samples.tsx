import { capitalize } from "es-toolkit"
import { useState } from "react"
import { Field } from "ui-components/field"
import { RadioGroup } from "ui-components/radio"
import { z } from "zod"

const fruitNameSchema = z.enum(["apple", "banana", "cherry"])
type FruitName = z.infer<typeof fruitNameSchema>
const fruitNames: FruitName[] = ["apple", "banana", "cherry"]

export const RadioSamples = () => {
    const [value, setValue] = useState<FruitName | undefined>(undefined)

    return (
        <Field label="Radio Fruits" required={false}>
            <RadioGroup
                itemSchema={fruitNameSchema}
                items={fruitNames}
                getItemLabel={capitalize}
                value={value}
                onValueChange={setValue}
            />
        </Field>
    )
}
