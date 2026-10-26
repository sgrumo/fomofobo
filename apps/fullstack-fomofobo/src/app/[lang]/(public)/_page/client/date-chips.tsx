"use client"

import { isBefore, parseISO } from "date-fns"
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
import { useState } from "react"
import { useTranslation } from "react-i18next"
import {
    BottomSheetContent,
    BottomSheetRoot,
    BottomSheetTitle,
} from "ui-components/bottom-sheet"
import { Button } from "ui-components/button"
import { Chip, ChipBar, ChipRow } from "ui-components/chip"
import { DateInput } from "ui-components/date-input"
import { Field } from "ui-components/field"

import type { RouteClientComponentProps } from "@/framework/routes/routes"

interface DateChipsProps extends RouteClientComponentProps<"root"> {
    query: Pick<MapQuery, "date" | "from" | "to" | "free">
    now: Date
    onChange: (change: MapQuery) => void
    className?: string
}

export const DateChips = (props: DateChipsProps) => {
    const { t } = useTranslation("shared")
    const [sheetOpen, setSheetOpen] = useState(false)
    const [draftFrom, setDraftFrom] = useState<Date>()
    const [draftTo, setDraftTo] = useState<Date>()

    const rangeLabel = rangeLabelOf(props.query) ?? t("Filters.Range")
    const today = earliestRangeDayOf(props.now)
    const draftValid =
        draftFrom !== undefined &&
        draftTo !== undefined &&
        isValidRange(draftFrom, draftTo, today)

    const openSheet = () => {
        setDraftFrom(
            props.query.from === undefined ? undefined : parseISO(props.query.from),
        )
        setDraftTo(props.query.to === undefined ? undefined : parseISO(props.query.to))
        setSheetOpen(true)
    }

    return (
        <>
            {/* The free chip shares the row: one more row covers more of the map. */}
            <ChipRow label={t("Filters.DatesAndPrice")} className={props.className}>
                <ChipBar label={t("Filters.Dates")}>
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
                        label={rangeLabel}
                        pressed={props.query.date === "range"}
                        onPressedChange={openSheet}
                    />
                </ChipBar>
                <Chip
                    label={t("Price.Free")}
                    pressed={props.query.free === true}
                    onPressedChange={free => {
                        props.onChange(freeQueryOf(free))
                    }}
                />
            </ChipRow>
            <BottomSheetRoot open={sheetOpen} onOpenChange={setSheetOpen}>
                <BottomSheetContent>
                    <BottomSheetTitle>{t("Filters.RangeTitle")}</BottomSheetTitle>
                    <div className="flex flex-col gap-4">
                        <Field label={t("Filters.From")} required={true}>
                            <DateInput
                                mode="custom"
                                value={draftFrom}
                                onValueChange={setDraftFrom}
                                isDayDisabled={day => isBefore(day, today)}
                                className="w-full"
                            />
                        </Field>
                        <Field label={t("Filters.To")} required={true}>
                            <DateInput
                                mode="custom"
                                value={draftTo}
                                onValueChange={setDraftTo}
                                isDayDisabled={day => isBefore(day, draftFrom ?? today)}
                                className="w-full"
                            />
                        </Field>
                        <div className="flex justify-end gap-2">
                            <Button
                                variant="secondary"
                                size="md"
                                onClick={() => {
                                    setSheetOpen(false)
                                    props.onChange(NO_DATE_FILTER)
                                }}
                            >
                                {t("Filters.Clear")}
                            </Button>
                            <Button
                                variant="primary"
                                size="md"
                                disabled={!draftValid}
                                onClick={() => {
                                    if (
                                        draftFrom === undefined ||
                                        draftTo === undefined
                                    ) {
                                        return
                                    }
                                    setSheetOpen(false)
                                    props.onChange(rangeQueryOf(draftFrom, draftTo))
                                }}
                            >
                                {t("Filters.Apply")}
                            </Button>
                        </div>
                    </div>
                </BottomSheetContent>
            </BottomSheetRoot>
        </>
    )
}
