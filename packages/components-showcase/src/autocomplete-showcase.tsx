import { useState } from "react"
import { Autocomplete } from "ui-components/autocomplete"
import { Field } from "ui-components/field"

import { fruitSchema, fruits } from "./components-showcase.helper"

export const AutocompleteShowcase = () => {
    const [value, setValue] = useState<string | undefined>(undefined)
    const [complexValue, setComplexValue] = useState<string | undefined>(undefined)
    const [loadingValue, setLoadingValue] = useState<string | undefined>(undefined)
    const [disabledValue, setDisabledValue] = useState<string | undefined>(undefined)
    const [disabledWithValue, setDisabledWithValue] = useState<string | undefined>(
        fruits[0]?.label,
    )
    const [emptyValue, setEmptyValue] = useState<string | undefined>(undefined)
    const [describedValue, setDescribedValue] = useState<string | undefined>(undefined)

    return (
        <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(min(100%,18rem),18rem))] justify-center gap-8">
            <div className="flex flex-col gap-4">
                <p className="tp-h4-medium">Standard</p>
                <Field label="Autocomplete" required={false}>
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
            </div>
            <div className="flex flex-col gap-4">
                <p className="tp-h4-medium">Complex</p>
                <Field label="Autocomplete" required={false}>
                    <Autocomplete
                        itemSchema={fruitSchema}
                        items={fruits}
                        value={complexValue}
                        onValueChange={setComplexValue}
                        getItemId={fruit => fruit.id}
                        getItemValue={fruit => fruit.label}
                        renderItem={({ item }) => (
                            <div className="flex items-center gap-2">
                                <div
                                    className="size-3 shrink-0 rounded-full"
                                    style={{ backgroundColor: item.color }}
                                />
                                {item.label}
                            </div>
                        )}
                        className="w-full"
                    />
                </Field>
            </div>
            <div className="flex flex-col gap-4">
                <p className="tp-h4-medium">Loading</p>
                <Field label="Autocomplete" required={false}>
                    <Autocomplete
                        itemSchema={fruitSchema}
                        items={fruits}
                        value={loadingValue}
                        onValueChange={setLoadingValue}
                        getItemId={fruit => fruit.id}
                        getItemValue={fruit => fruit.label}
                        renderItem={({ item }) => <span>{item.label}</span>}
                        className="w-full"
                        loading={true}
                    />
                </Field>
            </div>
            <div className="flex flex-col gap-4">
                <p className="tp-h4-medium">Disabled</p>
                <Field label="Autocomplete" disabled={true} required={false}>
                    <Autocomplete
                        itemSchema={fruitSchema}
                        items={fruits}
                        value={disabledValue}
                        onValueChange={setDisabledValue}
                        getItemId={fruit => fruit.id}
                        getItemValue={fruit => fruit.label}
                        renderItem={({ item }) => <span>{item.label}</span>}
                        className="w-full"
                    />
                </Field>
            </div>
            <div className="flex flex-col gap-4">
                <p className="tp-h4-medium">Disabled with value</p>
                <Field label="Autocomplete" disabled={true} required={false}>
                    <Autocomplete
                        itemSchema={fruitSchema}
                        items={fruits}
                        value={disabledWithValue}
                        onValueChange={setDisabledWithValue}
                        getItemId={fruit => fruit.id}
                        getItemValue={fruit => fruit.label}
                        renderItem={({ item }) => <span>{item.label}</span>}
                        className="w-full"
                    />
                </Field>
            </div>
            <div className="flex flex-col gap-4">
                <p className="tp-h4-medium">With description</p>
                <Field
                    label="Autocomplete"
                    description="Start typing to filter the fruit suggestions."
                    required={false}
                >
                    <Autocomplete
                        itemSchema={fruitSchema}
                        items={fruits}
                        value={describedValue}
                        onValueChange={setDescribedValue}
                        getItemId={fruit => fruit.id}
                        getItemValue={fruit => fruit.label}
                        renderItem={({ item }) => <span>{item.label}</span>}
                        className="w-full"
                    />
                </Field>
            </div>
            <div className="flex flex-col gap-4">
                <p className="tp-h4-medium">Empty</p>
                <Field label="Autocomplete" required={false}>
                    <Autocomplete
                        itemSchema={fruitSchema}
                        items={[]}
                        value={emptyValue}
                        onValueChange={setEmptyValue}
                        getItemId={fruit => fruit.id}
                        getItemValue={fruit => fruit.label}
                        renderItem={({ item }) => <span>{item.label}</span>}
                        className="w-full"
                    />
                </Field>
            </div>
        </div>
    )
}
