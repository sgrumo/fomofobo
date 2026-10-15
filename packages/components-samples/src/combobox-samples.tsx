import { useState } from "react"
import { Combobox } from "ui-components/combobox"
import { Field } from "ui-components/field"

import type { Fruit } from "./components-samples.helper"
import { fruits } from "./components-samples.helper"

export const ComboboxSamples = () => {
    const [singleValue, setSingleValue] = useState<Fruit | undefined>(undefined)
    const [multiValue, setMultiValue] = useState<Fruit[]>([])
    const [asyncValue, setAsyncValue] = useState<Fruit | undefined>(undefined)
    const [asyncSearch, setAsyncSearch] = useState("")

    const asyncItems = fruits.filter(fruit =>
        fruit.label.toLowerCase().includes(asyncSearch.toLowerCase()),
    )
    const onAsyncSearchChange = (search = "") => {
        setAsyncSearch(search)
    }

    return (
        <div className="flex max-w-[18rem] flex-col gap-4">
            <Field label="Combobox Single Fruit" required={false}>
                <Combobox
                    type="standard"
                    async={false}
                    multiple={false}
                    resettable={true}
                    items={fruits}
                    value={singleValue}
                    onValueChange={setSingleValue}
                    getItemId={fruit => fruit.id}
                    getItemLabel={fruit => fruit.label}
                    renderItem={({ item }) => <span>{item.label}</span>}
                    className="w-full"
                />
            </Field>
            <Field label="Combobox Multiple Fruits" required={false}>
                <Combobox
                    type="standard"
                    async={false}
                    multiple={true}
                    resettable={true}
                    items={fruits}
                    value={multiValue}
                    onValueChange={setMultiValue}
                    getItemId={fruit => fruit.id}
                    getItemLabel={fruit => fruit.label}
                    renderItem={({ item }) => <span>{item.label}</span>}
                    className="w-full"
                />
            </Field>
            <Field label="Combobox Async Fruit" required={false}>
                <Combobox
                    type="standard"
                    async={true}
                    multiple={false}
                    resettable={false}
                    items={asyncItems}
                    value={asyncValue}
                    onValueChange={setAsyncValue}
                    getItemId={fruit => fruit.id}
                    getItemLabel={fruit => fruit.label}
                    renderItem={({ item }) => <span>{item.label}</span>}
                    fetching={false}
                    search={asyncSearch}
                    onSearchChange={onAsyncSearchChange}
                    minimumSearchLength={3}
                    className="w-full"
                />
            </Field>
        </div>
    )
}
