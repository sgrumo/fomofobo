import { capitalize } from "es-toolkit"
import { useState } from "react"
import { Checkbox, CheckboxGroup } from "ui-components/checkbox"
import type { CheckboxState } from "ui-components/checkbox"
import { Field } from "ui-components/field"
import { z } from "zod"

const fruitNameSchema = z.enum(["apple", "banana", "cherry"])
type FruitName = z.infer<typeof fruitNameSchema>
const fruitNames: FruitName[] = ["apple", "banana", "cherry"]

export const CheckboxSamples = () => {
    const [checked, setChecked] = useState<CheckboxState>(false)
    const [indeterminate, setIndeterminate] = useState<CheckboxState>("indeterminate")
    const [groupValue, setGroupValue] = useState<FruitName[]>([])

    return (
        <div className="flex flex-col items-start gap-4">
            <Field label="Sample Checkbox" labelSide="right" required={false}>
                <Checkbox value={checked} onValueChange={setChecked} />
            </Field>
            <Field label="Indeterminate Checkbox" labelSide="right" required={false}>
                <Checkbox value={indeterminate} onValueChange={setIndeterminate} />
            </Field>
            <Field label="Checkbox Fruits" required={false}>
                <CheckboxGroup
                    itemSchema={fruitNameSchema}
                    items={fruitNames}
                    getItemLabel={capitalize}
                    value={groupValue}
                    onValueChange={setGroupValue}
                />
            </Field>
        </div>
    )
}
