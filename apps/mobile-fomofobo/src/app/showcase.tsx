import { Redirect } from "expo-router"
import { useState } from "react"
import { ScrollView, View } from "react-native"

import { Button } from "@/components/ui/button/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card/card"
import { Checkbox } from "@/components/ui/checkbox/checkbox"
import { Input } from "@/components/ui/input/input"
import { RadioGroup } from "@/components/ui/radio-group/radio-group"
import { MultiSelect } from "@/components/ui/select/multi-select"
import { Select } from "@/components/ui/select/select"
import type { Option } from "@/components/ui/select/select"
import { Switch } from "@/components/ui/switch/switch"
import { SegmentedTabs } from "@/components/ui/tabs/tabs"
import type { TabItem } from "@/components/ui/tabs/tabs"
import { Text } from "@/components/ui/text/text"
import { toast, toastError, toastSuccess } from "@/components/ui/toast/toast"

const noop = () => {
    // No operation
}

const FRUIT_OPTIONS: readonly Option[] = [
    { label: "Apple", value: "apple" },
    { label: "Banana", value: "banana" },
    { label: "Orange", value: "orange" },
    { label: "Strawberry", value: "strawberry" },
]

const SIZE_OPTIONS = [
    { label: "Small", value: "sm" },
    { label: "Medium", value: "md" },
    { label: "Large", value: "lg" },
] as const

const TAB_ITEMS: readonly TabItem[] = [
    { value: "first", label: "First", content: <Text>First tab content</Text> },
    { value: "second", label: "Second", content: <Text>Second tab content</Text> },
    { value: "third", label: "Third", content: <Text>Third tab content</Text> },
]

const ShowcaseSection = (props: { title: string; children: React.ReactNode }) => (
    <View className="gap-3 border-b border-neutral-200 pb-6">
        <Text variant="h3">{props.title}</Text>
        {props.children}
    </View>
)

const TypographyShowcase = () => (
    <ShowcaseSection title="Typography">
        <Text variant="h1">Heading 1</Text>
        <Text variant="h2">Heading 2</Text>
        <Text variant="h3">Heading 3</Text>
        <Text variant="h4">Heading 4</Text>
        <Text variant="p">
            This is a paragraph. It demonstrates the default paragraph styling with proper
            line height and spacing.
        </Text>
        <Text variant="lead">Lead text for introductions</Text>
        <Text variant="large">Large text</Text>
        <Text variant="small">Small text</Text>
        <Text variant="muted">Muted text for secondary content</Text>
        <Text variant="blockquote">This is a blockquote with italic styling</Text>
        <Text variant="code">const x = &quot;inline code&quot;</Text>
    </ShowcaseSection>
)

const ButtonShowcase = () => (
    <ShowcaseSection title="Button">
        <View className="flex-row flex-wrap gap-2">
            <Button variant="default">
                <Text>Default</Text>
            </Button>
            <Button variant="destructive">
                <Text>Destructive</Text>
            </Button>
            <Button variant="outline">
                <Text>Outline</Text>
            </Button>
            <Button variant="secondary">
                <Text>Secondary</Text>
            </Button>
            <Button variant="ghost">
                <Text>Ghost</Text>
            </Button>
            <Button variant="link">
                <Text>Link</Text>
            </Button>
        </View>
        <View className="flex-row flex-wrap gap-2">
            <Button size="sm">
                <Text>Small</Text>
            </Button>
            <Button size="default">
                <Text>Default</Text>
            </Button>
            <Button size="lg">
                <Text>Large</Text>
            </Button>
        </View>
        <Button disabled={true}>
            <Text>Disabled</Text>
        </Button>
    </ShowcaseSection>
)

const InputShowcase = () => {
    const [text, setText] = useState("")
    return (
        <ShowcaseSection title="Input">
            <Input
                placeholder="Type something..."
                value={text}
                onChangeText={setText}
                accessibilityLabel="Example text input"
            />
            <Input
                placeholder="Disabled input"
                editable={false}
                accessibilityLabel="Disabled input example"
            />
        </ShowcaseSection>
    )
}

const CardShowcase = () => (
    <ShowcaseSection title="Card">
        <Card>
            <CardHeader>
                <CardTitle>Card Title</CardTitle>
                <CardDescription>Card description with supporting text</CardDescription>
            </CardHeader>
            <CardContent>
                <Text>This is the card content area. It can contain any components.</Text>
            </CardContent>
            <CardFooter>
                <Button size="sm">
                    <Text>Action</Text>
                </Button>
            </CardFooter>
        </Card>
    </ShowcaseSection>
)

const CheckboxShowcase = () => {
    const [checked, setChecked] = useState(false)
    return (
        <ShowcaseSection title="Checkbox">
            <View className="flex-row items-center gap-3">
                <Checkbox
                    checked={checked}
                    onToggle={() => {
                        setChecked(prev => !prev)
                    }}
                    accessibilityLabel="Example checkbox"
                />
                <Text>{checked ? "Checked" : "Unchecked"}</Text>
            </View>
        </ShowcaseSection>
    )
}

const SwitchShowcase = () => {
    const [enabled, setEnabled] = useState(false)
    return (
        <ShowcaseSection title="Switch">
            <View className="flex-row items-center gap-3">
                <Switch
                    checked={enabled}
                    onToggle={() => {
                        setEnabled(prev => !prev)
                    }}
                    accessibilityLabel="Example switch"
                />
                <Text>{enabled ? "On" : "Off"}</Text>
            </View>
            <View className="flex-row items-center gap-3">
                <Switch
                    checked={true}
                    onToggle={noop}
                    disabled={true}
                    accessibilityLabel="Disabled switch"
                />
                <Text variant="muted">Disabled</Text>
            </View>
        </ShowcaseSection>
    )
}

const SelectShowcase = () => {
    const [selected, setSelected] = useState<Option | undefined>(undefined)
    return (
        <ShowcaseSection title="Select">
            <Select
                value={selected}
                onValueChange={setSelected}
                options={FRUIT_OPTIONS}
                placeholder="Select a fruit..."
                title="Pick a fruit"
                accessibilityLabel="Pick a fruit"
            />
            <Text variant="muted">Selected: {selected?.label ?? "None"}</Text>
        </ShowcaseSection>
    )
}

const MultiSelectShowcase = () => {
    const [selected, setSelected] = useState<readonly Option[]>([])
    return (
        <ShowcaseSection title="MultiSelect">
            <MultiSelect
                value={selected}
                onValueChange={setSelected}
                options={FRUIT_OPTIONS}
                placeholder="Select fruits..."
                title="Pick fruits"
                accessibilityLabel="Pick fruits"
            />
            <Text variant="muted">
                Selected:{" "}
                {selected.length > 0 ? selected.map(o => o.label).join(", ") : "None"}
            </Text>
        </ShowcaseSection>
    )
}

const RadioGroupShowcase = () => {
    const [size, setSize] = useState<string | undefined>(undefined)
    return (
        <ShowcaseSection title="RadioGroup">
            <RadioGroup
                value={size}
                onValueChange={setSize}
                options={SIZE_OPTIONS}
                accessibilityLabel="Pick a size"
            />
            <Text variant="muted">Selected: {size ?? "None"}</Text>
        </ShowcaseSection>
    )
}

const TabsShowcase = () => (
    <ShowcaseSection title="SegmentedTabs">
        <SegmentedTabs
            items={TAB_ITEMS}
            defaultValue="first"
            accessibilityLabel="Example tabs"
        />
    </ShowcaseSection>
)

const ToastShowcase = () => (
    <ShowcaseSection title="Toast">
        <View className="flex-row flex-wrap gap-2">
            <Button
                variant="default"
                size="sm"
                onPress={() => {
                    toast({ title: "Info", message: "Something happened" })
                }}
            >
                <Text>Info</Text>
            </Button>
            <Button
                variant="default"
                size="sm"
                onPress={() => {
                    toastSuccess("Success", "Operation completed")
                }}
            >
                <Text>Success</Text>
            </Button>
            <Button
                variant="outline"
                size="sm"
                onPress={() => {
                    toastError("Error", "Something went wrong")
                }}
            >
                <Text>Error</Text>
            </Button>
        </View>
    </ShowcaseSection>
)

// Dev-only: a deep link still reaches the route in a production build
const ShowcaseScreen = () =>
    __DEV__ ? (
        <ScrollView className="flex-1" contentContainerClassName="gap-6 px-4 py-4 pb-8">
            <Text variant="h2" accessibilityRole="header">
                UI Components
            </Text>
            <TypographyShowcase />
            <ButtonShowcase />
            <InputShowcase />
            <CardShowcase />
            <CheckboxShowcase />
            <SwitchShowcase />
            <SelectShowcase />
            <MultiSelectShowcase />
            <RadioGroupShowcase />
            <TabsShowcase />
            <ToastShowcase />
        </ScrollView>
    ) : (
        <Redirect href="/" />
    )

export default ShowcaseScreen
