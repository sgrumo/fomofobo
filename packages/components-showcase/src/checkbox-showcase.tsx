import { capitalize } from "es-toolkit"
import { useState } from "react"
import { Checkbox, CheckboxGroup } from "ui-components/checkbox"
import type { CheckboxState } from "ui-components/checkbox"
import { Field } from "ui-components/field"
import { z } from "zod"

type Fruit = "apple" | "banana" | "cherry"
const fruitSchema = z.enum(["apple", "banana", "cherry"])
const fruits: Fruit[] = ["apple", "banana", "cherry"]

export const CheckboxShowcase = () => {
    const [checked, setChecked] = useState<CheckboxState>(false)
    const [indeterminate, setIndeterminate] = useState<CheckboxState>("indeterminate")
    const [disabledChecked, setDisabledChecked] = useState<CheckboxState>(true)
    const [disabledUnchecked, setDisabledUnchecked] = useState<CheckboxState>(false)
    const [required, setRequired] = useState<CheckboxState>(false)
    const [described, setDescribed] = useState<CheckboxState>(false)
    const [groupValue, setGroupValue] = useState<Fruit[]>(["apple"])
    const [groupDisabledValue, setGroupDisabledValue] = useState<Fruit[]>(["banana"])
    const [groupDescribedValue, setGroupDescribedValue] = useState<Fruit[]>([])

    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4">
                <p className="tp-h4-medium">Checkbox</p>
                <div className="flex flex-wrap gap-6">
                    <Field label="Default" labelSide="right" required={false}>
                        <Checkbox value={checked} onValueChange={setChecked} />
                    </Field>
                    <Field label="Indeterminate" labelSide="right" required={false}>
                        <Checkbox
                            value={indeterminate}
                            onValueChange={setIndeterminate}
                        />
                    </Field>
                    <Field
                        label="Disabled (checked)"
                        disabled={true}
                        labelSide="right"
                        required={false}
                    >
                        <Checkbox
                            value={disabledChecked}
                            onValueChange={setDisabledChecked}
                        />
                    </Field>
                    <Field
                        label="Disabled (unchecked)"
                        disabled={true}
                        labelSide="right"
                        required={false}
                    >
                        <Checkbox
                            value={disabledUnchecked}
                            onValueChange={setDisabledUnchecked}
                        />
                    </Field>
                    <Field label="Required" required={true} labelSide="right">
                        <Checkbox value={required} onValueChange={setRequired} />
                    </Field>
                    <Field
                        label="With Description"
                        description="Check to receive the weekly newsletter."
                        labelSide="right"
                        required={false}
                    >
                        <Checkbox value={described} onValueChange={setDescribed} />
                    </Field>
                </div>
            </div>
            <div className="flex flex-col gap-4">
                <p className="tp-h4-medium">Checkbox Group</p>
                <div className="flex flex-wrap gap-8">
                    <Field label="Fruits" required={false}>
                        <CheckboxGroup
                            itemSchema={fruitSchema}
                            items={fruits}
                            getItemLabel={capitalize}
                            value={groupValue}
                            onValueChange={setGroupValue}
                        />
                    </Field>
                    <Field label="Fruits (disabled)" disabled={true} required={false}>
                        <CheckboxGroup
                            itemSchema={fruitSchema}
                            items={fruits}
                            getItemLabel={capitalize}
                            value={groupDisabledValue}
                            onValueChange={setGroupDisabledValue}
                        />
                    </Field>
                    <Field
                        label="Fruits (with description)"
                        description="Select all the fruits you want in the basket."
                        required={false}
                    >
                        <CheckboxGroup
                            itemSchema={fruitSchema}
                            items={fruits}
                            getItemLabel={capitalize}
                            value={groupDescribedValue}
                            onValueChange={setGroupDescribedValue}
                        />
                    </Field>
                </div>
            </div>
        </div>
    )
}
