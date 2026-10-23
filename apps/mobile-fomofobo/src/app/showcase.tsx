import type { BottomSheetModal } from "@gorhom/bottom-sheet"
import { pixelIconNames } from "domain/pixel-icons"
import { formatEuroCents } from "domain/price-summary"
import { Redirect } from "expo-router"
import { useRef, useState } from "react"
import type { ReactNode } from "react"
import { ScrollView, View } from "react-native"

import { Badge } from "@/components/ui/badge/badge"
import { BottomSheet } from "@/components/ui/bottom-sheet/bottom-sheet"
import { Button } from "@/components/ui/button/button"
import { Chip, ChipRow } from "@/components/ui/chip/chip"
import { DateRangePicker } from "@/components/ui/date-range-picker/date-range-picker"
import type { DateRange } from "@/components/ui/date-range-picker/date-range-picker"
import { DitheredPhoto } from "@/components/ui/dithered-photo/dithered-photo"
import { IconButton } from "@/components/ui/icon-button/icon-button"
import { Input } from "@/components/ui/input/input"
import { KeyValueList } from "@/components/ui/key-value-list/key-value-list"
import { Notice } from "@/components/ui/notice/notice"
import { PixelCircle } from "@/components/ui/pixel-circle/pixel-circle"
import { PixelIcon } from "@/components/ui/pixel-icon/pixel-icon"
import { PixelPanel } from "@/components/ui/pixel-panel/pixel-panel"
import { SearchField } from "@/components/ui/search-field/search-field"
import { MultiSelect } from "@/components/ui/select/multi-select"
import { Select } from "@/components/ui/select/select"
import type { Option } from "@/components/ui/select/select"
import { Spinner } from "@/components/ui/spinner/spinner"
import { StatGrid } from "@/components/ui/stat-grid/stat-grid"
import { Text } from "@/components/ui/text/text"
import { Timeline } from "@/components/ui/timeline/timeline"
import { toast, toastError, toastSuccess } from "@/components/ui/toast/toast"
import { env } from "@/lib/env"
import { hardShadow } from "@/lib/theme/hard-shadow"

const noop = () => {
    // No operation
}

// Disables the past days of the range picker
const bundleLoadedAt = new Date()

const CATEGORY_OPTIONS: readonly Option[] = [
    { label: "Music", value: "music" },
    { label: "Comedy", value: "comedy" },
    { label: "Art", value: "art" },
    { label: "Cinema", value: "cinema" },
]

const TYPE_SCALE_VARIANTS = [
    "pixel-2xl",
    "pixel-xl",
    "pixel-lg",
    "pixel-md",
    "pixel-sm",
    "body-lg",
    "body-md",
    "body-sm",
] as const

/**
 * @description Returns the UTF-16 code units of a string in hex, to tell a no-break space from a space
 * @param text String read
 */
const codeUnits = (text: string) =>
    Array.from({ length: text.length }, (_, index) =>
        (text.codePointAt(index) ?? 0).toString(16).padStart(4, "0"),
    ).join(" ")

const ShowcaseSection = (props: { title: string; children: ReactNode }) => (
    <View className="gap-3 border-b-2 border-line-muted pb-6">
        <Text variant="pixel-lg" accessibilityRole="header">
            {props.title}
        </Text>
        {props.children}
    </View>
)

const TypographyShowcase = () => (
    <ShowcaseSection title="Typography">
        {TYPE_SCALE_VARIANTS.map(variant => (
            <Text key={variant} variant={variant}>
                {variant} fomofobo
            </Text>
        ))}
        <Text variant="body-md" className="text-fg-muted">
            fg-muted body text
        </Text>
    </ShowcaseSection>
)

const PixelShowcase = () => (
    <ShowcaseSection title="Pixel">
        <View className="flex-row flex-wrap gap-3">
            {pixelIconNames.map(name => (
                <PixelIcon key={name} name={name} size={24} />
            ))}
        </View>
        <View className="flex-row flex-wrap items-center gap-4">
            <PixelCircle size={32} fill="live" shadow="md">
                <PixelIcon name="music" centered={true} />
            </PixelCircle>
            <PixelCircle size={36} fill="upcoming" shadow="md">
                <PixelIcon name="comedy" centered={true} />
            </PixelCircle>
            <PixelCircle size={40} fill="ended" shadow="md">
                <PixelIcon name="art" centered={true} />
            </PixelCircle>
            <PixelCircle size={48} fill="permanent" shadow="md">
                <PixelIcon name="cinema" size={20} centered={true} />
            </PixelCircle>
            <PixelCircle size={48} fill="surface-inverse">
                <PixelIcon name="locate" size={20} color="fg-inverse" centered={true} />
            </PixelCircle>
        </View>
        <PixelPanel shadow="md" className="px-3 py-2.5">
            <Text variant="pixel-md">Pixel corners panel</Text>
        </PixelPanel>
        <View
            className="self-start rounded-md border-2 border-line bg-social px-3 py-2"
            style={hardShadow("md")}
        >
            <Text variant="pixel-sm">Hard shadow</Text>
        </View>
        <DitheredPhoto
            uri={`${env.apiUrl}/fallbacks/music.png`}
            label="Dithered fallback photo"
            className="aspect-video w-full border-2 border-line"
        />
    </ShowcaseSection>
)

const ButtonShowcase = () => (
    <ShowcaseSection title="Button">
        <View className="flex-row flex-wrap gap-3">
            <Button>
                <Text>Primary</Text>
            </Button>
            <Button variant="accent">
                <Text>Accent</Text>
            </Button>
            <Button variant="secondary">
                <Text>Secondary</Text>
            </Button>
            <Button variant="tertiary">
                <Text>Tertiary</Text>
            </Button>
            <Button destructive={true}>
                <Text>Delete</Text>
            </Button>
        </View>
        <View className="flex-row flex-wrap items-center gap-3">
            <Button size="sm" icon="share">
                <Text>Small</Text>
            </Button>
            <Button icon="directions" variant="secondary">
                <Text>Directions</Text>
            </Button>
            <Button disabled={true}>
                <Text>Disabled</Text>
            </Button>
        </View>
    </ShowcaseSection>
)

const IconButtonShowcase = () => (
    <ShowcaseSection title="IconButton">
        <View className="flex-row flex-wrap items-center gap-4">
            <IconButton icon="back" label="Back" size="sm" onPress={noop} />
            <IconButton icon="share" label="Share" onPress={noop} />
            <IconButton
                icon="locate"
                label="Locate"
                size="lg"
                tone="inverse"
                onPress={noop}
            />
            <IconButton icon="save" label="Save" tone="live" onPress={noop} />
            <IconButton icon="close" label="Close" disabled={true} onPress={noop} />
        </View>
    </ShowcaseSection>
)

const ChipShowcase = () => {
    const [selected, setSelected] = useState<readonly string[]>(["music"])
    const toggle = (value: string) => (pressed: boolean) => {
        setSelected(current =>
            pressed ? [...current, value] : current.filter(item => item !== value),
        )
    }
    return (
        <ShowcaseSection title="Chip">
            <ChipRow label="Categories">
                <Chip
                    label="Music"
                    icon="music"
                    count={12}
                    pressed={selected.includes("music")}
                    onPressedChange={toggle("music")}
                />
                <Chip
                    label="Comedy"
                    icon="comedy"
                    count={3}
                    pressed={selected.includes("comedy")}
                    onPressedChange={toggle("comedy")}
                />
                <Chip
                    label="Today"
                    pressed={selected.includes("today")}
                    onPressedChange={toggle("today")}
                />
                <Chip
                    label="Free"
                    pressed={selected.includes("free")}
                    onPressedChange={toggle("free")}
                />
                <Chip
                    label="Disabled"
                    pressed={false}
                    disabled={true}
                    onPressedChange={noop}
                />
            </ChipRow>
        </ShowcaseSection>
    )
}

const BadgeShowcase = () => (
    <ShowcaseSection title="Badge">
        <View className="flex-row flex-wrap gap-2">
            <Badge tone="live" dot={true}>
                Live
            </Badge>
            <Badge tone="upcoming">Upcoming</Badge>
            <Badge tone="ended">Ended</Badge>
            <Badge tone="permanent">Permanent</Badge>
            <Badge dot={true}>Neutral</Badge>
            <Badge tone="inverse">Inverse</Badge>
        </View>
    </ShowcaseSection>
)

const FieldShowcase = () => {
    const [query, setQuery] = useState("")
    const [text, setText] = useState("")
    const [category, setCategory] = useState<Option>()
    const [categories, setCategories] = useState<readonly Option[]>([])
    return (
        <ShowcaseSection title="Fields">
            <SearchField
                label="Search events"
                placeholder="Search events or venues"
                value={query}
                onValueChange={setQuery}
            />
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
            <Select
                label="Category"
                value={category}
                onValueChange={setCategory}
                options={CATEGORY_OPTIONS}
                title="Pick a category"
            />
            <MultiSelect
                label="Categories"
                value={categories}
                onValueChange={setCategories}
                options={CATEGORY_OPTIONS}
                title="Pick categories"
            />
        </ShowcaseSection>
    )
}

const SheetShowcase = () => {
    const sheetRef = useRef<BottomSheetModal>(null)
    const [range, setRange] = useState<DateRange>({})
    return (
        <ShowcaseSection title="BottomSheet and DateRangePicker">
            <Button
                variant="secondary"
                icon="calendar"
                onPress={() => {
                    sheetRef.current?.present()
                }}
            >
                <Text>Pick dates</Text>
            </Button>
            <Text variant="body-md" className="text-fg-muted">
                {range.from?.toDateString() ?? "No start"} -{" "}
                {range.to?.toDateString() ?? "No end"}
            </Text>
            <BottomSheet ref={sheetRef} title="Dates">
                <DateRangePicker
                    defaultValue={range}
                    onValueChange={setRange}
                    minDate={bundleLoadedAt}
                />
                <Button
                    onPress={() => {
                        sheetRef.current?.dismiss()
                    }}
                >
                    <Text>Apply</Text>
                </Button>
            </BottomSheet>
        </ShowcaseSection>
    )
}

const FeedbackShowcase = () => (
    <ShowcaseSection title="Notice, Toast, Spinner">
        <Notice tone="loading" lines={["Loading the events"]} />
        <Notice tone="info" lines={["Offline: showing the last results"]} />
        <Notice tone="success" lines={["Saved"]} />
        <Notice tone="warning" lines={["Too many searches", "Try again in a minute"]} />
        <Notice tone="error" lines={["The events did not load"]} />
        <View className="flex-row flex-wrap gap-3">
            <Button
                size="sm"
                variant="secondary"
                onPress={() => {
                    toast({ title: "Info", message: "Something happened" })
                }}
            >
                <Text>Info</Text>
            </Button>
            <Button
                size="sm"
                variant="secondary"
                onPress={() => {
                    toastSuccess("Saved", "The event is in your list")
                }}
            >
                <Text>Success</Text>
            </Button>
            <Button
                size="sm"
                variant="secondary"
                onPress={() => {
                    toastError("Error", "Something went wrong")
                }}
            >
                <Text>Error</Text>
            </Button>
        </View>
        <View className="flex-row items-center gap-4">
            <Spinner label="Loading" size="sm" />
            <Spinner label="Loading" />
            <Spinner label="Loading" size="lg" color="live" />
        </View>
    </ShowcaseSection>
)

const DataShowcase = () => (
    <ShowcaseSection title="StatGrid, KeyValueList, Timeline">
        <StatGrid
            items={[
                { label: "Price", value: formatEuroCents(550) },
                { label: "Capacity", value: "120" },
                { label: "Age", value: "18+" },
            ]}
        />
        <KeyValueList
            items={[
                { key: "full", label: "Full price", value: formatEuroCents(500) },
                { key: "reduced", label: "Students", value: formatEuroCents(550) },
            ]}
        />
        <Text variant="body-sm" className="text-fg-muted">
            formatEuroCents(500): {codeUnits(formatEuroCents(500))}
        </Text>
        <Text variant="body-sm" className="text-fg-muted">
            formatEuroCents(550): {codeUnits(formatEuroCents(550))}
        </Text>
        <Timeline
            label="Event progress"
            value={40}
            min={0}
            max={100}
            valueText="40%"
            start="20:00"
            now="Now"
            end="23:00"
            tone="live"
        />
    </ShowcaseSection>
)

// Dev-only: a deep link still reaches the route in a production build
const ShowcaseScreen = () =>
    __DEV__ ? (
        <ScrollView className="flex-1" contentContainerClassName="gap-6 px-4 py-4 pb-8">
            <TypographyShowcase />
            <PixelShowcase />
            <ButtonShowcase />
            <IconButtonShowcase />
            <ChipShowcase />
            <BadgeShowcase />
            <FieldShowcase />
            <SheetShowcase />
            <FeedbackShowcase />
            <DataShowcase />
        </ScrollView>
    ) : (
        <Redirect href="/" />
    )

export default ShowcaseScreen
