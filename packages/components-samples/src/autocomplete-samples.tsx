import { useState } from "react"
import { Autocomplete } from "ui-components/autocomplete"
import { Field } from "ui-components/field"

import { fruitSchema, fruits } from "./components-samples.helper"

export const AutocompleteSamples = () => {
    const [value, setValue] = useState<string | undefined>(undefined)

    return (
        <Field label="Autocomplete Fruit" required={false} className="max-w-[18rem]">
            <Autocomplete
                itemSchema={fruitSchema}
                items={fruits}
                value={value}
                onValueChange={setValue}
                getItemId={fruit => fruit.id}
                getItemValue={fruit => fruit.label}
                renderItem={({ item }) => <span>{item.label}</span>}
                className="w-full"
            />
        </Field>
    )
}
