import { useQuery, useQueryClient } from "@tanstack/react-query"
import { identity } from "es-toolkit"
import { cn } from "frontend-shared/styles"
import { useState } from "react"
import { Button } from "ui-components/button"
import { Combobox } from "ui-components/combobox"
import { Field } from "ui-components/field"

import type { Fruit } from "./components-showcase.helper"
import { fruits } from "./components-showcase.helper"

const querySingleKey = ["combobox-showcase-query-single"]
const queryMultiKey = ["combobox-showcase-query-multi"]

const dragonfruit: Fruit = { id: "99", label: "Dragonfruit", color: "#ff1493" }
const starfruit: Fruit = { id: "98", label: "Starfruit", color: "#ffd700" }

/**
 * @description Fetches the fruits whose label holds the search text
 * @param search Text matched against the label
 * @remarks Resolves after a one second delay, to mimic network latency
 */
const fetchFruits = (search: string): Promise<Fruit[]> =>
    new Promise(resolve => {
        setTimeout(() => {
            resolve(
                fruits.filter(fruit =>
                    fruit.label.toLowerCase().includes(search.toLowerCase()),
                ),
            )
        }, 1000)
    })

export const ComboboxShowcase = () => {
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
    const [singleNotSearchableValue, setSingleNotSearchableValue] = useState<
        Fruit | undefined
    >(undefined)
    const [multiNotSearchableValue, setMultiNotSearchableValue] = useState<Fruit[]>([])
    const [singleQueryValue, setSingleQueryValue] = useState<Fruit | undefined>(undefined)
    const [multiQueryValue, setMultiQueryValue] = useState<Fruit[]>([])
    const [singleAsyncQueryValue, setSingleAsyncQueryValue] = useState<Fruit | undefined>(
        undefined,
    )
    const [multiAsyncQueryValue, setMultiAsyncQueryValue] = useState<Fruit[]>([])
    const [singleEmptyValue, setSingleEmptyValue] = useState<Fruit | undefined>(undefined)
    const [multiEmptyValue, setMultiEmptyValue] = useState<Fruit[]>([])
    const [singleErrorValue, setSingleErrorValue] = useState<Fruit | undefined>(undefined)
    const [multiErrorValue, setMultiErrorValue] = useState<Fruit[]>([])
    const [singleDescribedValue, setSingleDescribedValue] = useState<Fruit | undefined>(
        undefined,
    )
    const [multiDescribedValue, setMultiDescribedValue] = useState<Fruit[]>([])
    const [singleEmptyNotSearchableValue, setSingleEmptyNotSearchableValue] = useState<
        Fruit | undefined
    >(undefined)
    const [multiEmptyNotSearchableValue, setMultiEmptyNotSearchableValue] = useState<
        Fruit[]
    >([])
    const [singleNotResettableValue, setSingleNotResettableValue] = useState<
        Fruit | undefined
    >(fruits[0])
    const [multiNotResettableValue, setMultiNotResettableValue] = useState<Fruit[]>(
        fruits.slice(0, 2),
    )

    const queryClient = useQueryClient()
    const onResetQueries = () => {
        void queryClient.resetQueries({ queryKey: querySingleKey })
        void queryClient.resetQueries({ queryKey: queryMultiKey })
    }

    const minimumSearchLength = 3

    const [asyncMinLenSingleValue, setAsyncMinLenSingleValue] = useState<
        Fruit | undefined
    >(undefined)
    const [asyncMinLenSingleSearch, setAsyncMinLenSingleSearch] = useState("")
    const { data: asyncMinLenSingleItems = [], isFetching: asyncMinLenSingleFetching } =
        useQuery({
            queryKey: ["combobox-showcase-min-len-single", asyncMinLenSingleSearch],
            queryFn: () => fetchFruits(asyncMinLenSingleSearch),
            enabled: asyncMinLenSingleSearch.length >= minimumSearchLength,
            staleTime: 0,
            gcTime: 0,
        })

    const [asyncMinLenMultiValue, setAsyncMinLenMultiValue] = useState<Fruit[]>([])
    const [asyncMinLenMultiSearch, setAsyncMinLenMultiSearch] = useState("")
    const { data: asyncMinLenMultiItems = [], isFetching: asyncMinLenMultiFetching } =
        useQuery({
            queryKey: ["combobox-showcase-min-len-multi", asyncMinLenMultiSearch],
            queryFn: () => fetchFruits(asyncMinLenMultiSearch),
            enabled: asyncMinLenMultiSearch.length >= minimumSearchLength,
            staleTime: 0,
            gcTime: 0,
        })

    const onAsyncMinLenSingleSearchChange = (search = "") => {
        setAsyncMinLenSingleSearch(search)
    }
    const onAsyncMinLenMultiSearchChange = (search = "") => {
        setAsyncMinLenMultiSearch(search)
    }

    return (
        <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(min(100%,18rem),18rem))] justify-center gap-8">
            <div className="flex flex-col gap-4">
                <p className="tp-h4-medium">Standard</p>
                <Field label="Single" required={false}>
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
                <Field label="Multiple" required={false}>
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
            </div>
            <div className="flex flex-col gap-4">
                <p className="tp-h4-medium">Error</p>
                <Field label="Single" errors={["Selection is required"]} required={false}>
                    <Combobox
                        type="standard"
                        async={false}
                        multiple={false}
                        resettable={true}
                        items={fruits}
                        value={singleErrorValue}
                        onValueChange={setSingleErrorValue}
                        getItemId={fruit => fruit.id}
                        getItemLabel={fruit => fruit.label}
                        renderItem={({ item }) => <span>{item.label}</span>}
                        className="w-full"
                    />
                </Field>
                <Field
                    label="Multiple"
                    errors={["Selection is required"]}
                    required={false}
                >
                    <Combobox
                        type="standard"
                        async={false}
                        multiple={true}
                        resettable={true}
                        items={fruits}
                        value={multiErrorValue}
                        onValueChange={setMultiErrorValue}
                        getItemId={fruit => fruit.id}
                        getItemLabel={fruit => fruit.label}
                        renderItem={({ item }) => <span>{item.label}</span>}
                        className="w-full"
                    />
                </Field>
            </div>
            <div className="flex flex-col gap-4">
                <p className="tp-h4-medium">Complex</p>
                <Field label="Single" required={false}>
                    <Combobox
                        type="standard"
                        async={false}
                        multiple={false}
                        resettable={true}
                        items={fruits}
                        value={singleComplexValue}
                        onValueChange={setSingleComplexValue}
                        getItemId={fruit => fruit.id}
                        getItemLabel={fruit => fruit.label}
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
                <Field label="Multiple" required={false}>
                    <Combobox
                        type="standard"
                        async={false}
                        multiple={true}
                        resettable={true}
                        items={fruits}
                        value={multiComplexValue}
                        onValueChange={setMultiComplexValue}
                        getItemId={fruit => fruit.id}
                        getItemLabel={fruit => fruit.label}
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
                <p className="tp-h4-medium">Loading</p>
                <Field label="Single" required={false}>
                    <Combobox
                        type="standard"
                        async={false}
                        multiple={false}
                        resettable={true}
                        items={fruits}
                        value={singleLoadingValue}
                        onValueChange={setSingleLoadingValue}
                        getItemId={fruit => fruit.id}
                        getItemLabel={fruit => fruit.label}
                        renderItem={({ item }) => <span>{item.label}</span>}
                        className="w-full"
                        loading={true}
                    />
                </Field>
                <Field label="Multiple" required={false}>
                    <Combobox
                        type="standard"
                        async={false}
                        multiple={true}
                        resettable={true}
                        items={fruits}
                        value={multiLoadingValue}
                        onValueChange={setMultiLoadingValue}
                        getItemId={fruit => fruit.id}
                        getItemLabel={fruit => fruit.label}
                        renderItem={({ item }) => <span>{item.label}</span>}
                        className="w-full"
                        loading={true}
                    />
                </Field>
            </div>
            <div className="flex flex-col gap-4">
                <p className="tp-h4-medium">Disabled</p>
                <Field label="Single" disabled={true} required={false}>
                    <Combobox
                        type="standard"
                        async={false}
                        multiple={false}
                        resettable={true}
                        items={fruits}
                        value={singleDisabledValue}
                        onValueChange={setSingleDisabledValue}
                        getItemId={fruit => fruit.id}
                        getItemLabel={fruit => fruit.label}
                        renderItem={({ item }) => <span>{item.label}</span>}
                        className="w-full"
                    />
                </Field>
                <Field label="Multiple" disabled={true} required={false}>
                    <Combobox
                        type="standard"
                        async={false}
                        multiple={true}
                        resettable={true}
                        items={fruits}
                        value={multiDisabledValue}
                        onValueChange={setMultiDisabledValue}
                        getItemId={fruit => fruit.id}
                        getItemLabel={fruit => fruit.label}
                        renderItem={({ item }) => <span>{item.label}</span>}
                        className="w-full"
                    />
                </Field>
            </div>
            <div className="flex flex-col gap-4">
                <p className="tp-h4-medium">Injected value</p>
                <Field label="Single" required={false}>
                    <Combobox
                        type="standard"
                        async={false}
                        multiple={false}
                        resettable={true}
                        items={fruits}
                        value={singleInjectedValue}
                        onValueChange={setSingleInjectedValue}
                        getItemId={fruit => fruit.id}
                        getItemLabel={fruit => fruit.label}
                        renderItem={({ item }) => <span>{item.label}</span>}
                        className="w-full"
                    />
                </Field>
                <Field label="Multiple" required={false}>
                    <Combobox
                        type="standard"
                        async={false}
                        multiple={true}
                        resettable={true}
                        items={fruits}
                        value={multiInjectedValue}
                        onValueChange={setMultiInjectedValue}
                        getItemId={fruit => fruit.id}
                        getItemLabel={fruit => fruit.label}
                        renderItem={({ item }) => <span>{item.label}</span>}
                        className="w-full"
                    />
                </Field>
            </div>
            <div className="flex flex-col gap-4">
                <p className="tp-h4-medium">Disabled with values</p>
                <Field label="Single" disabled={true} required={false}>
                    <Combobox
                        type="standard"
                        async={false}
                        multiple={false}
                        resettable={true}
                        items={fruits}
                        value={singleDisabledWithValue}
                        onValueChange={setSingleDisabledWithValue}
                        getItemId={fruit => fruit.id}
                        getItemLabel={fruit => fruit.label}
                        renderItem={({ item }) => <span>{item.label}</span>}
                        className="w-full"
                    />
                </Field>
                <Field label="Multiple" disabled={true} required={false}>
                    <Combobox
                        type="standard"
                        async={false}
                        multiple={true}
                        resettable={true}
                        items={fruits}
                        value={multiDisabledWithValue}
                        onValueChange={setMultiDisabledWithValue}
                        getItemId={fruit => fruit.id}
                        getItemLabel={fruit => fruit.label}
                        renderItem={({ item }) => <span>{item.label}</span>}
                        className="w-full"
                    />
                </Field>
            </div>
            <div className="flex flex-col gap-4">
                <p className="tp-h4-medium">Async (min length {minimumSearchLength})</p>
                <Field label="Single" required={false}>
                    <Combobox
                        type="standard"
                        async={true}
                        multiple={false}
                        resettable={true}
                        items={asyncMinLenSingleItems}
                        value={asyncMinLenSingleValue}
                        onValueChange={setAsyncMinLenSingleValue}
                        getItemId={fruit => fruit.id}
                        getItemLabel={fruit => fruit.label}
                        renderItem={({ item }) => <span>{item.label}</span>}
                        fetching={asyncMinLenSingleFetching}
                        search={asyncMinLenSingleSearch}
                        onSearchChange={onAsyncMinLenSingleSearchChange}
                        minimumSearchLength={minimumSearchLength}
                        className="w-full"
                    />
                </Field>
                <Field label="Multiple" required={false}>
                    <Combobox
                        type="standard"
                        async={true}
                        multiple={true}
                        resettable={true}
                        items={asyncMinLenMultiItems}
                        value={asyncMinLenMultiValue}
                        onValueChange={setAsyncMinLenMultiValue}
                        getItemId={fruit => fruit.id}
                        getItemLabel={fruit => fruit.label}
                        renderItem={({ item }) => <span>{item.label}</span>}
                        fetching={asyncMinLenMultiFetching}
                        search={asyncMinLenMultiSearch}
                        onSearchChange={onAsyncMinLenMultiSearchChange}
                        minimumSearchLength={minimumSearchLength}
                        className="w-full"
                    />
                </Field>
            </div>
            <div className="flex flex-col gap-4">
                <p className="tp-h4-medium">Not searchable</p>
                <Field label="Single" required={false}>
                    <Combobox
                        type="standard"
                        async={false}
                        multiple={false}
                        resettable={true}
                        items={fruits}
                        value={singleNotSearchableValue}
                        onValueChange={setSingleNotSearchableValue}
                        getItemId={fruit => fruit.id}
                        getItemLabel={fruit => fruit.label}
                        renderItem={({ item }) => <span>{item.label}</span>}
                        searchable={false}
                        className="w-full"
                    />
                </Field>
                <Field label="Multiple" required={false}>
                    <Combobox
                        type="standard"
                        async={false}
                        multiple={true}
                        resettable={true}
                        items={fruits}
                        value={multiNotSearchableValue}
                        onValueChange={setMultiNotSearchableValue}
                        getItemId={fruit => fruit.id}
                        getItemLabel={fruit => fruit.label}
                        renderItem={({ item }) => <span>{item.label}</span>}
                        searchable={false}
                        className="w-full"
                    />
                </Field>
            </div>
            <div className="flex flex-col gap-4">
                <p className="tp-h4-medium">Query</p>
                <Button
                    variant="secondary"
                    size="sm"
                    type="button"
                    onClick={onResetQueries}
                    className="w-full"
                >
                    Reset queries
                </Button>
                <Field label="Single" required={false}>
                    <Combobox<Fruit>
                        type="query"
                        async={false}
                        multiple={false}
                        resettable={true}
                        query={{
                            queryKey: querySingleKey,
                            queryFn: () => fetchFruits(""),
                            select: identity,
                        }}
                        value={singleQueryValue}
                        onValueChange={setSingleQueryValue}
                        getItemId={fruit => fruit.id}
                        getItemLabel={fruit => fruit.label}
                        renderItem={({ item }) => <span>{item.label}</span>}
                        className="w-full"
                    />
                </Field>
                <Field label="Multiple" required={false}>
                    <Combobox<Fruit>
                        type="query"
                        async={false}
                        multiple={true}
                        resettable={true}
                        query={{
                            queryKey: queryMultiKey,
                            queryFn: () => fetchFruits(""),
                            select: identity,
                        }}
                        value={multiQueryValue}
                        onValueChange={setMultiQueryValue}
                        getItemId={fruit => fruit.id}
                        getItemLabel={fruit => fruit.label}
                        renderItem={({ item }) => <span>{item.label}</span>}
                        className="w-full"
                    />
                </Field>
            </div>
            <div className="flex flex-col gap-4">
                <p className="tp-h4-medium">
                    Async query (min length {minimumSearchLength})
                </p>
                <Field label="Single" required={false}>
                    <Combobox<Fruit>
                        type="query"
                        async={true}
                        multiple={false}
                        resettable={true}
                        minimumSearchLength={minimumSearchLength}
                        query={search => ({
                            queryKey: ["combobox-showcase-async-query-single", search],
                            queryFn: () => fetchFruits(search ?? ""),
                            select: identity,
                        })}
                        value={singleAsyncQueryValue}
                        onValueChange={setSingleAsyncQueryValue}
                        getItemId={fruit => fruit.id}
                        getItemLabel={fruit => fruit.label}
                        renderItem={({ item }) => <span>{item.label}</span>}
                        className="w-full"
                    />
                </Field>
                <Field label="Multiple" required={false}>
                    <Combobox<Fruit>
                        type="query"
                        async={true}
                        multiple={true}
                        resettable={true}
                        minimumSearchLength={minimumSearchLength}
                        query={search => ({
                            queryKey: ["combobox-showcase-async-query-multi", search],
                            queryFn: () => fetchFruits(search ?? ""),
                            select: identity,
                        })}
                        value={multiAsyncQueryValue}
                        onValueChange={setMultiAsyncQueryValue}
                        getItemId={fruit => fruit.id}
                        getItemLabel={fruit => fruit.label}
                        renderItem={({ item }) => <span>{item.label}</span>}
                        className="w-full"
                    />
                </Field>
            </div>
            <div className="flex flex-col gap-4">
                <p className="tp-h4-medium">With description</p>
                <Field
                    label="Single"
                    description="Search and pick your favorite fruit."
                    required={false}
                >
                    <Combobox
                        type="standard"
                        async={false}
                        multiple={false}
                        resettable={true}
                        items={fruits}
                        value={singleDescribedValue}
                        onValueChange={setSingleDescribedValue}
                        getItemId={fruit => fruit.id}
                        getItemLabel={fruit => fruit.label}
                        renderItem={({ item }) => <span>{item.label}</span>}
                        className="w-full"
                    />
                </Field>
                <Field
                    label="Multiple"
                    description="Search and pick every fruit you like."
                    required={false}
                >
                    <Combobox
                        type="standard"
                        async={false}
                        multiple={true}
                        resettable={true}
                        items={fruits}
                        value={multiDescribedValue}
                        onValueChange={setMultiDescribedValue}
                        getItemId={fruit => fruit.id}
                        getItemLabel={fruit => fruit.label}
                        renderItem={({ item }) => <span>{item.label}</span>}
                        className="w-full"
                    />
                </Field>
            </div>
            <div className="flex flex-col gap-4">
                <p className="tp-h4-medium">Empty</p>
                <Field label="Single" required={false}>
                    <Combobox<Fruit>
                        type="standard"
                        async={false}
                        multiple={false}
                        resettable={true}
                        items={[]}
                        value={singleEmptyValue}
                        onValueChange={setSingleEmptyValue}
                        getItemId={fruit => fruit.id}
                        getItemLabel={fruit => fruit.label}
                        renderItem={({ item }) => <span>{item.label}</span>}
                        className="w-full"
                    />
                </Field>
                <Field label="Multiple" required={false}>
                    <Combobox<Fruit>
                        type="standard"
                        async={false}
                        multiple={true}
                        resettable={true}
                        items={[]}
                        value={multiEmptyValue}
                        onValueChange={setMultiEmptyValue}
                        getItemId={fruit => fruit.id}
                        getItemLabel={fruit => fruit.label}
                        renderItem={({ item }) => <span>{item.label}</span>}
                        className="w-full"
                    />
                </Field>
            </div>
            <div className="flex flex-col gap-4">
                <p className="tp-h4-medium">Empty not searchable</p>
                <Field label="Single" required={false}>
                    <Combobox<Fruit>
                        type="standard"
                        async={false}
                        multiple={false}
                        resettable={true}
                        items={[]}
                        value={singleEmptyNotSearchableValue}
                        onValueChange={setSingleEmptyNotSearchableValue}
                        getItemId={fruit => fruit.id}
                        getItemLabel={fruit => fruit.label}
                        renderItem={({ item }) => <span>{item.label}</span>}
                        searchable={false}
                        className="w-full"
                    />
                </Field>
                <Field label="Multiple" required={false}>
                    <Combobox<Fruit>
                        type="standard"
                        async={false}
                        multiple={true}
                        resettable={true}
                        items={[]}
                        value={multiEmptyNotSearchableValue}
                        onValueChange={setMultiEmptyNotSearchableValue}
                        getItemId={fruit => fruit.id}
                        getItemLabel={fruit => fruit.label}
                        renderItem={({ item }) => <span>{item.label}</span>}
                        searchable={false}
                        className="w-full"
                    />
                </Field>
            </div>
            <div className="flex flex-col gap-4">
                <p className="tp-h4-medium">Not resettable</p>
                <Field label="Single" required={true}>
                    <Combobox
                        type="standard"
                        async={false}
                        multiple={false}
                        resettable={false}
                        items={fruits}
                        value={singleNotResettableValue}
                        onValueChange={setSingleNotResettableValue}
                        getItemId={fruit => fruit.id}
                        getItemLabel={fruit => fruit.label}
                        renderItem={({ item }) => <span>{item.label}</span>}
                        className="w-full"
                    />
                </Field>
                <Field label="Multiple" required={true}>
                    <Combobox
                        type="standard"
                        async={false}
                        multiple={true}
                        resettable={false}
                        items={fruits}
                        value={multiNotResettableValue}
                        onValueChange={setMultiNotResettableValue}
                        getItemId={fruit => fruit.id}
                        getItemLabel={fruit => fruit.label}
                        renderItem={({ item }) => <span>{item.label}</span>}
                        className="w-full"
                    />
                </Field>
            </div>
        </div>
    )
}
