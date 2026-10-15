import { useState } from "react"
import { Field } from "ui-components/field"
import { Select } from "ui-components/select"

import type { Fruit } from "./components-samples.helper"
import { fruits } from "./components-samples.helper"

export const SelectSamples = () => {
    const [singleValue, setSingleValue] = useState<Fruit | undefined>(undefined)
    const [multiValue, setMultiValue] = useState<Fruit[]>([])

    return (
        <div className="flex max-w-[18rem] flex-col gap-4">
            <Field label="Select Single Fruit" required={false}>
                <Select
                    multiple={false}
                    resettable={true}
                    items={fruits}
                    value={singleValue}
                    onValueChange={setSingleValue}
                    getItemId={fruit => fruit.id}
                    renderItem={({ item }) => <span>{item.label}</span>}
                    className="w-full"
                />
            </Field>
            <Field label="Select Multiple Fruits" required={false}>
                <Select
                    multiple={true}
                    resettable={false}
                    items={fruits}
                    value={multiValue}
                    onValueChange={setMultiValue}
                    getItemId={fruit => fruit.id}
                    renderItem={({ item }) => <span>{item.label}</span>}
                    className="w-full"
                />
            </Field>
        </div>
    )
}
