"use client"

import { format, isBefore, parseISO } from "date-fns"
import type { DateFilterKind, LocalDate } from "models"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import {
    BottomSheetContent,
    BottomSheetRoot,
    BottomSheetTitle,
} from "ui-components/bottom-sheet"
import { Button } from "ui-components/button"
import { Chip, ChipRow } from "ui-components/chip"
import { DateInput } from "ui-components/date-input"
import { Field } from "ui-components/field"

import type { RouteClientComponentProps } from "@/framework/routes/routes"
import { localDateOf } from "@/lib/events/date-window"
import { PLATFORM_TIME_ZONE } from "@/lib/platform/platform"

interface DateFilter {
    date: DateFilterKind | undefined
    from: LocalDate | undefined
    to: LocalDate | undefined
}

const NO_DATE_FILTER: DateFilter = { date: undefined, from: undefined, to: undefined }

const QUICK_KINDS = ["today", "tomorrow", "weekend"] as const

interface DateChipsProps extends RouteClientComponentProps<"root">, DateFilter {
    now: Date
    free: boolean
    onChange: (filter: DateFilter) => void
    onFreeChange: (free: boolean) => void
    className?: string
}

export const DateChips = (props: DateChipsProps) => {
    const { t } = useTranslation("shared")
    const [sheetOpen, setSheetOpen] = useState(false)
    const [draftFrom, setDraftFrom] = useState<Date>()
    const [draftTo, setDraftTo] = useState<Date>()

    const rangeLabel =
        props.date === "range" && props.from !== undefined && props.to !== undefined
            ? `${format(parseISO(props.from), "dd/MM")}–${format(parseISO(props.to), "dd/MM")}`
            : t("Filters.Range")
    // PLACEHOLDER(OP-09): a range starts today at the earliest
    // The range holds days of the platform zone, shown as midnights of the device.
    const today = parseISO(localDateOf(props.now, PLATFORM_TIME_ZONE))
    const draftValid =
        draftFrom !== undefined &&
        draftTo !== undefined &&
        !isBefore(draftFrom, today) &&
        !isBefore(draftTo, draftFrom)

    const openSheet = () => {
        setDraftFrom(props.from === undefined ? undefined : parseISO(props.from))
        setDraftTo(props.to === undefined ? undefined : parseISO(props.to))
        setSheetOpen(true)
    }

    return (
        <>
            {/* The free chip shares the row: one more row covers more of the map. */}
            <ChipRow label={t("Filters.DatesAndPrice")} className={props.className}>
                {QUICK_KINDS.map(kind => (
                    <Chip
                        key={kind}
                        label={t(`Filters.${kind}`)}
                        pressed={props.date === kind}
                        onPressedChange={pressed => {
                            props.onChange(
                                pressed
                                    ? { ...NO_DATE_FILTER, date: kind }
                                    : NO_DATE_FILTER,
                            )
                        }}
                    />
                ))}
                <Chip
                    label={rangeLabel}
                    pressed={props.date === "range"}
                    onPressedChange={openSheet}
                />
                <Chip
                    label={t("Price.Free")}
                    pressed={props.free}
                    onPressedChange={props.onFreeChange}
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
                                    props.onChange({
                                        date: "range",
                                        from: format(draftFrom, "yyyy-MM-dd"),
                                        to: format(draftTo, "yyyy-MM-dd"),
                                    })
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
