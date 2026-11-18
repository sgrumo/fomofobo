"use client"

import { isBefore, parseISO } from "date-fns"
import type { RangeDraft } from "domain/map-filters"
import {
    earliestRangeDayOf,
    isInRange,
    NO_DATE_FILTER,
    QUICK_DATE_KINDS,
    quickDateQueryOf,
    rangeDraftOf,
    rangeLabelOf,
    rangeQueryOf,
} from "domain/map-filters"
import type { MapQuery } from "domain/map-query"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Button } from "ui-components/button"
import { Chip, ChipBar, ChipRow } from "ui-components/chip"
import { DayPicker } from "ui-components/day-picker"
import {
    PopoverContent,
    PopoverDescription,
    PopoverRoot,
    PopoverTitle,
    PopoverTrigger,
} from "ui-components/popover"

import type { RouteClientComponentProps } from "@/framework/routes/routes"

interface DateChipsProps extends RouteClientComponentProps<"map"> {
    query: Pick<MapQuery, "date" | "from" | "to">
    now: Date
    onChange: (change: MapQuery) => void
    className?: string
}

export const DateChips = (props: DateChipsProps) => {
    const { t } = useTranslation("shared")
    const [calendarOpen, setCalendarOpen] = useState(false)
    const [draft, setDraft] = useState<RangeDraft>({ from: undefined, to: undefined })

    const rangeActive = props.query.date === "range"
    const rangeLabel = rangeLabelOf(props.query) ?? t("Filters.Range")
    const today = earliestRangeDayOf(props.now)

    const changeCalendarOpen = (open: boolean) => {
        if (open) {
            setDraft({
                from:
                    props.query.from === undefined
                        ? undefined
                        : parseISO(props.query.from),
                to: props.query.to === undefined ? undefined : parseISO(props.query.to),
            })
        }
        setCalendarOpen(open)
    }
    const pickDay = (day: Date) => {
        const next = rangeDraftOf(draft, day)
        setDraft(next)
        if (next.from !== undefined && next.to !== undefined) {
            setCalendarOpen(false)
            props.onChange(rangeQueryOf(next.from, next.to))
        }
    }

    return (
        <ChipRow label={t("Filters.Dates")} className={props.className}>
            <ChipBar label={t("Filters.QuickDates")}>
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
                <PopoverRoot open={calendarOpen} onOpenChange={changeCalendarOpen}>
                    <PopoverTrigger
                        render={<Chip label={rangeLabel} pressed={rangeActive} />}
                    />
                    <PopoverContent
                        className="gap-2 p-3"
                        positionerProps={{ side: "bottom", align: "start" }}
                    >
                        <PopoverTitle>{t("Filters.RangeTitle")}</PopoverTitle>
                        <PopoverDescription>
                            {draft.from !== undefined && draft.to === undefined
                                ? t("Filters.RangeEnd")
                                : t("Filters.RangeStart")}
                        </PopoverDescription>
                        <DayPicker
                            value={draft.to ?? draft.from}
                            onValueChange={pickDay}
                            isDayDisabled={day => isBefore(day, today)}
                            isDaySelected={day => isInRange(draft, day)}
                        />
                        {rangeActive ? (
                            <Button
                                variant="secondary"
                                size="sm"
                                className="self-end"
                                onClick={() => {
                                    setCalendarOpen(false)
                                    props.onChange(NO_DATE_FILTER)
                                }}
                            >
                                {t("Filters.Clear")}
                            </Button>
                        ) : undefined}
                    </PopoverContent>
                </PopoverRoot>
            </ChipBar>
        </ChipRow>
    )
}
