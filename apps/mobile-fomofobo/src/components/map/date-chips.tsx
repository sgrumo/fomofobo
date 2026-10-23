import type { BottomSheetModal } from "@gorhom/bottom-sheet"
import { parseISO } from "date-fns"
import {
    earliestRangeDayOf,
    freeQueryOf,
    isValidRange,
    NO_DATE_FILTER,
    QUICK_DATE_KINDS,
    quickDateQueryOf,
    rangeLabelOf,
    rangeQueryOf,
} from "domain/map-filters"
import type { MapQuery } from "domain/map-query"
import { useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { View } from "react-native"

import { BottomSheet } from "@/components/ui/bottom-sheet/bottom-sheet"
import { Button } from "@/components/ui/button/button"
import { Chip, ChipRow } from "@/components/ui/chip/chip"
import { DateRangePicker } from "@/components/ui/date-range-picker/date-range-picker"
import type { DateRange } from "@/components/ui/date-range-picker/date-range-picker"
import { Text } from "@/components/ui/text/text"

type DateChipsQuery = Pick<MapQuery, "date" | "from" | "to" | "free">

interface RangeSheetContentProps {
    query: DateChipsQuery
    earliest: Date
    onApply: (from: Date, to: Date) => void
    onClear: () => void
}

// Holds the draft in its own state: the sheet passes props one render late
const RangeSheetContent = (props: RangeSheetContentProps) => {
    const { t } = useTranslation("shared")
    const [draft, setDraft] = useState<DateRange>({
        from: props.query.from === undefined ? undefined : parseISO(props.query.from),
        to: props.query.to === undefined ? undefined : parseISO(props.query.to),
    })
    const { from, to } = draft
    const valid =
        from !== undefined && to !== undefined && isValidRange(from, to, props.earliest)

    return (
        <View className="gap-4">
            <DateRangePicker
                defaultValue={draft}
                onValueChange={setDraft}
                minDate={props.earliest}
            />
            <View className="flex-row justify-end gap-2">
                <Button variant="secondary" onPress={props.onClear}>
                    <Text>{t("Filters.Clear")}</Text>
                </Button>
                <Button
                    disabled={!valid}
                    onPress={() => {
                        if (from !== undefined && to !== undefined) {
                            props.onApply(from, to)
                        }
                    }}
                >
                    <Text>{t("Filters.Apply")}</Text>
                </Button>
            </View>
        </View>
    )
}

interface DateChipsProps {
    query: DateChipsQuery
    now: Date
    onChange: (change: MapQuery) => void
}

export const DateChips = (props: DateChipsProps) => {
    const { t } = useTranslation("shared")
    const sheetRef = useRef<BottomSheetModal>(null)
    const earliest = earliestRangeDayOf(props.now)

    return (
        <>
            {/* The free chip shares the row: one more row covers more of the map */}
            <ChipRow label={t("Filters.DatesAndPrice")} wrap={true}>
                {QUICK_DATE_KINDS.map(kind => (
                    <Chip
                        key={kind}
                        label={t(`Filters.${kind}`)}
                        pressed={props.query.date === kind}
                        onPressedChange={pressed => {
                            props.onChange(quickDateQueryOf(kind, pressed))
                        }}
                    />
                ))}
                <Chip
                    label={rangeLabelOf(props.query) ?? t("Filters.Range")}
                    pressed={props.query.date === "range"}
                    onPressedChange={() => {
                        sheetRef.current?.present()
                    }}
                />
                {/* PLACEHOLDER(TQ-37): a "Gratis" chip beside the date chips, with no count */}
                <Chip
                    label={t("Price.Free")}
                    pressed={props.query.free === true}
                    onPressedChange={free => {
                        props.onChange(freeQueryOf(free))
                    }}
                />
            </ChipRow>
            <BottomSheet ref={sheetRef} title={t("Filters.RangeTitle")}>
                <RangeSheetContent
                    query={props.query}
                    earliest={earliest}
                    onApply={(from, to) => {
                        sheetRef.current?.dismiss()
                        props.onChange(rangeQueryOf(from, to))
                    }}
                    onClear={() => {
                        sheetRef.current?.dismiss()
                        props.onChange(NO_DATE_FILTER)
                    }}
                />
            </BottomSheet>
        </>
    )
}
