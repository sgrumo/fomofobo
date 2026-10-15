import { cn } from "frontend-shared/styles"
import { useState } from "react"
import { Field } from "ui-components/field"
import { Select } from "ui-components/select"

import type { Fruit } from "./components-showcase.helper"
import { fruits } from "./components-showcase.helper"

const dragonfruit: Fruit = { id: "99", label: "Dragonfruit", color: "#ff1493" }
const starfruit: Fruit = { id: "98", label: "Starfruit", color: "#ffd700" }

export const SelectShowcase = () => {
    const [singleValue, setSingleValue] = useState<Fruit | undefined>(undefined)
    const [multiValue, setMultiValue] = useState<Fruit[]>([])
    const [singleComplexValue, setSingleComplexValue] = useState<Fruit | undefined>(
        undefined,
    )
    const [multiComplexValue, setMultiComplexValue] = useState<Fruit[]>([])
    const [singleLoadingValue, setSingleLoadingValue] = useState<Fruit | undefined>(
        undefined,
    )
    const [multiLoadingValue, setMultiLoadingValue] = useState<Fruit[]>([])
    const [singleDisabledValue, setSingleDisabledValue] = useState<Fruit | undefined>(
        undefined,
    )
    const [multiDisabledValue, setMultiDisabledValue] = useState<Fruit[]>([])
    const [singleInjectedValue, setSingleInjectedValue] = useState<Fruit | undefined>(
        dragonfruit,
    )
    const [multiInjectedValue, setMultiInjectedValue] = useState<Fruit[]>([
        dragonfruit,
        starfruit,
    ])
    const [singleDisabledWithValue, setSingleDisabledWithValue] = useState<
        Fruit | undefined
    >(fruits[0])
    const [multiDisabledWithValue, setMultiDisabledWithValue] = useState<Fruit[]>(
        fruits.slice(0, 2),
    )
    const [singleEmptyValue, setSingleEmptyValue] = useState<Fruit | undefined>(undefined)
    const [multiEmptyValue, setMultiEmptyValue] = useState<Fruit[]>([])
    const [singleErrorValue, setSingleErrorValue] = useState<Fruit | undefined>(undefined)
    const [multiErrorValue, setMultiErrorValue] = useState<Fruit[]>([])
    const [singleDescribedValue, setSingleDescribedValue] = useState<Fruit | undefined>(
        undefined,
    )
    const [multiDescribedValue, setMultiDescribedValue] = useState<Fruit[]>([])
    const [singleNotResettableValue, setSingleNotResettableValue] = useState<
        Fruit | undefined
    >(fruits[0])
    const [multiNotResettableValue, setMultiNotResettableValue] = useState<Fruit[]>(
        fruits.slice(0, 2),
    )

    return (
        <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(min(100%,18rem),18rem))] justify-center gap-8">
            <div className="flex flex-col gap-4">
                <p className="tp-pixel-lg">Standard</p>
                <Field required={false} label="Single">
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
                <Field required={false} label="Multiple">
                    <Select
                        multiple={true}
                        resettable={true}
                        items={fruits}
                        value={multiValue}
                        onValueChange={setMultiValue}
                        getItemId={fruit => fruit.id}
                        renderItem={({ item }) => <span>{item.label}</span>}
                        className="w-full"
                    />
                </Field>
            </div>
            <div className="flex flex-col gap-4">
                <p className="tp-pixel-lg">Error</p>
                <Field required={false} label="Single" errors={["Selection is required"]}>
                    <Select
                        multiple={false}
                        resettable={true}
                        items={fruits}
                        value={singleErrorValue}
                        onValueChange={setSingleErrorValue}
                        getItemId={fruit => fruit.id}
                        renderItem={({ item }) => <span>{item.label}</span>}
                        className="w-full"
                    />
                </Field>
                <Field
                    required={false}
                    label="Multiple"
                    errors={["Selection is required"]}
                >
                    <Select
                        multiple={true}
                        resettable={true}
                        items={fruits}
                        value={multiErrorValue}
                        onValueChange={setMultiErrorValue}
                        getItemId={fruit => fruit.id}
                        renderItem={({ item }) => <span>{item.label}</span>}
                        className="w-full"
                    />
                </Field>
            </div>
            <div className="flex flex-col gap-4">
                <p className="tp-pixel-lg">Complex</p>
                <Field required={false} label="Single">
                    <Select
                        multiple={false}
                        resettable={true}
                        items={fruits}
                        value={singleComplexValue}
                        onValueChange={setSingleComplexValue}
                        getItemId={fruit => fruit.id}
                        renderItem={({ item, position }) => (
                            <div className="flex items-center gap-2">
                                <div
                                    className={cn("size-3 shrink-0", {
                                        "rounded-sm": position === "trigger",
                                        "rounded-full": position === "list",
                                    })}
                                    style={{ backgroundColor: item.color }}
                                />
                                {item.label}
                            </div>
                        )}
                        className="w-full"
                    />
                </Field>
                <Field required={false} label="Multiple">
                    <Select
                        multiple={true}
                        resettable={true}
                        items={fruits}
                        value={multiComplexValue}
                        onValueChange={setMultiComplexValue}
                        getItemId={fruit => fruit.id}
                        renderItem={({ item, position }) => (
                            <div className="inline-flex items-center gap-2">
                                <div
                                    className={cn("size-3 shrink-0", {
                                        "rounded-sm": position === "trigger",
                                        "rounded-full": position === "list",
                                    })}
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
                <p className="tp-pixel-lg">Loading</p>
                <Field required={false} label="Single">
                    <Select
                        multiple={false}
                        resettable={true}
                        items={fruits}
                        value={singleLoadingValue}
                        onValueChange={setSingleLoadingValue}
                        getItemId={fruit => fruit.id}
                        renderItem={({ item }) => <span>{item.label}</span>}
                        className="w-full"
                        loading={true}
                    />
                </Field>
                <Field required={false} label="Multiple">
                    <Select
                        multiple={true}
                        resettable={true}
                        items={fruits}
                        value={multiLoadingValue}
                        onValueChange={setMultiLoadingValue}
                        getItemId={fruit => fruit.id}
                        renderItem={({ item }) => <span>{item.label}</span>}
                        className="w-full"
                        loading={true}
                    />
                </Field>
            </div>
            <div className="flex flex-col gap-4">
                <p className="tp-pixel-lg">Disabled</p>
                <Field required={false} label="Single" disabled={true}>
                    <Select
                        multiple={false}
                        resettable={true}
                        items={fruits}
                        value={singleDisabledValue}
                        onValueChange={setSingleDisabledValue}
                        getItemId={fruit => fruit.id}
                        renderItem={({ item }) => <span>{item.label}</span>}
                        className="w-full"
                    />
                </Field>
                <Field required={false} label="Multiple" disabled={true}>
                    <Select
                        multiple={true}
                        resettable={true}
                        items={fruits}
                        value={multiDisabledValue}
                        onValueChange={setMultiDisabledValue}
                        getItemId={fruit => fruit.id}
                        renderItem={({ item }) => <span>{item.label}</span>}
                        className="w-full"
                    />
                </Field>
            </div>
            <div className="flex flex-col gap-4">
                <p className="tp-pixel-lg">Disabled with values</p>
                <Field required={false} label="Single" disabled={true}>
                    <Select
                        multiple={false}
                        resettable={true}
                        items={fruits}
                        value={singleDisabledWithValue}
                        onValueChange={setSingleDisabledWithValue}
                        getItemId={fruit => fruit.id}
                        renderItem={({ item }) => <span>{item.label}</span>}
                        className="w-full"
                    />
                </Field>
                <Field required={false} label="Multiple" disabled={true}>
                    <Select
                        multiple={true}
                        resettable={true}
                        items={fruits}
                        value={multiDisabledWithValue}
                        onValueChange={setMultiDisabledWithValue}
                        getItemId={fruit => fruit.id}
                        renderItem={({ item }) => <span>{item.label}</span>}
                        className="w-full"
                    />
                </Field>
            </div>
            <div className="flex flex-col gap-4">
                <p className="tp-pixel-lg">Injected value</p>
                <Field required={false} label="Single">
                    <Select
                        multiple={false}
                        resettable={true}
                        items={fruits}
                        value={singleInjectedValue}
                        onValueChange={setSingleInjectedValue}
                        getItemId={fruit => fruit.id}
                        renderItem={({ item }) => <span>{item.label}</span>}
                        className="w-full"
                    />
                </Field>
                <Field required={false} label="Multiple">
                    <Select
                        multiple={true}
                        resettable={true}
                        items={fruits}
                        value={multiInjectedValue}
                        onValueChange={setMultiInjectedValue}
                        getItemId={fruit => fruit.id}
                        renderItem={({ item }) => <span>{item.label}</span>}
                        className="w-full"
                    />
                </Field>
            </div>
            <div className="flex flex-col gap-4">
                <p className="tp-pixel-lg">With description</p>
                <Field
                    required={false}
                    label="Single"
                    description="Pick your favorite fruit from the list."
                >
                    <Select
                        multiple={false}
                        resettable={true}
                        items={fruits}
                        value={singleDescribedValue}
                        onValueChange={setSingleDescribedValue}
                        getItemId={fruit => fruit.id}
                        renderItem={({ item }) => <span>{item.label}</span>}
                        className="w-full"
                    />
                </Field>
                <Field
                    required={false}
                    label="Multiple"
                    description="Pick every fruit you like; you can select more than one."
                >
                    <Select
                        multiple={true}
                        resettable={true}
                        items={fruits}
                        value={multiDescribedValue}
                        onValueChange={setMultiDescribedValue}
                        getItemId={fruit => fruit.id}
                        renderItem={({ item }) => <span>{item.label}</span>}
                        className="w-full"
                    />
                </Field>
            </div>
            <div className="flex flex-col gap-4">
                <p className="tp-pixel-lg">Empty</p>
                <Field required={false} label="Single">
                    <Select<Fruit>
                        multiple={false}
                        resettable={true}
                        items={[]}
                        value={singleEmptyValue}
                        onValueChange={setSingleEmptyValue}
                        getItemId={fruit => fruit.id}
                        renderItem={({ item }) => <span>{item.label}</span>}
                        className="w-full"
                    />
                </Field>
                <Field required={false} label="Multiple">
                    <Select<Fruit>
                        multiple={true}
                        resettable={true}
                        items={[]}
                        value={multiEmptyValue}
                        onValueChange={setMultiEmptyValue}
                        getItemId={fruit => fruit.id}
                        renderItem={({ item }) => <span>{item.label}</span>}
                        className="w-full"
                    />
                </Field>
            </div>
            <div className="flex flex-col gap-4">
                <p className="tp-pixel-lg">Not resettable</p>
                <Field label="Single" required={true}>
                    <Select
                        multiple={false}
                        resettable={false}
                        items={fruits}
                        value={singleNotResettableValue}
                        onValueChange={setSingleNotResettableValue}
                        getItemId={fruit => fruit.id}
                        renderItem={({ item }) => <span>{item.label}</span>}
                        className="w-full"
                    />
                </Field>
                <Field label="Multiple" required={true}>
                    <Select
                        multiple={true}
                        resettable={false}
                        items={fruits}
                        value={multiNotResettableValue}
                        onValueChange={setMultiNotResettableValue}
                        getItemId={fruit => fruit.id}
                        renderItem={({ item }) => <span>{item.label}</span>}
                        className="w-full"
                    />
                </Field>
            </div>
        </div>
    )
}
