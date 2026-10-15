import {
    addDays,
    addMonths,
    addWeeks,
    addYears,
    eachDayOfInterval,
    eachMonthOfInterval,
    endOfMonth,
    endOfWeek,
    endOfYear,
    isSameDay,
    isSameMonth,
    isSameYear,
    isToday,
    isValid,
    startOfMonth,
    startOfWeek,
    startOfYear,
    subDays,
    subMonths,
    subWeeks,
    subYears,
} from "date-fns"
import { capitalize, chunk, identity } from "es-toolkit"
import { pipe } from "es-toolkit/fp"
import { cn } from "frontend-shared/styles"
import type { KeyboardEvent } from "react"
import { useRef, useState } from "react"
import { flushSync } from "react-dom"
import { Result } from "shared/result"
import { formatDate, monthOfDate, weekDays } from "shared/temporal"
import { isDefined } from "shared/values"
import { match } from "ts-pattern"

import {
    useFieldCallbacks,
    useFieldContext,
    useFieldInputMode,
} from "../field/field.context"
import { useUiContext } from "../i18n/ui-context"
import type { UiTranslate } from "../i18n/ui-translations"
import { IconChevronRight } from "../icons/icons"
import { InputView } from "../input/input"
import type { DayPickerView } from "./day-picker.helper"

/**
 * @description Returns the localized month name of the date
 * @param day Date read
 * @param length Name form requested
 * @param t Translate function
 * @remarks Yields the `Shared.Unknown` translation for an invalid date
 */
const monthLabel = (day: Date, length: "full" | "short", t: UiTranslate) =>
    pipe(
        monthOfDate(day),
        Result.map(month => t(`Months.${capitalize(length)}.${month}`, undefined)),
        Result.unwrapOr(t("Shared.Unknown", undefined)),
    )

const weekCols = 7
const monthCols = 3
const yearCols = 3

/**
 * @remarks Caps the disabled-day scan against a pathological `isDayDisabled`
 */
const maxScanYears = 3

/**
 * @description Builds a date from the year, the month, and the day
 * @param year Full year of the date
 * @param month Zero-based month of the date
 * @param day Day of the month
 * @remarks Keeps a year under 100 unmapped, unlike the `Date` constructor
 */
const safeNewDate = (year: number, month = 0, day = 1) => {
    const date = new Date(0)
    date.setFullYear(year, month, day)
    return date
}

/**
 * @description Returns the first year and the last year of the window holding the anchor
 * @param anchor Date inside the window
 * @param step Count of years per window
 */
const yearWindow = (anchor: Date, step: number) => {
    const startYear = Math.floor(anchor.getFullYear() / step) * step
    return {
        startYear,
        endYear: startYear + step - 1,
    }
}

interface DayPickerDayCellProps {
    day: Date
    selected: boolean
    disabled: boolean
    focused: boolean
    onClick: (day: Date) => void
    onKeyDown: (event: KeyboardEvent<HTMLButtonElement>, day: Date) => void
}
const DayPickerDayCell = (props: DayPickerDayCellProps) => {
    const today = isToday(props.day)
    return (
        <button
            type="button"
            role="gridcell"
            aria-selected={props.selected}
            aria-disabled={props.disabled}
            aria-current={today ? "date" : undefined}
            tabIndex={props.focused ? 0 : -1}
            data-active={props.focused}
            onClick={() => {
                props.onClick(props.day)
            }}
            onKeyDown={event => {
                props.onKeyDown(event, props.day)
            }}
            className={cn("tp-body-md m-auto size-6 rounded-full transition-colors", {
                "bg-surface-inverse text-fg-inverse": props.selected,
                "ring-focus ring-1": today && !props.selected,
                "hover:bg-surface-muted/50": !props.selected && !props.disabled,
                "cursor-not-allowed opacity-50": props.disabled,
            })}
        >
            {props.day.getDate()}
        </button>
    )
}

const DayPickerWeekDayHeaderRow = () => {
    const { i18n } = useUiContext()
    return (
        <div
            role="row"
            className="grid"
            style={{ gridTemplateColumns: `repeat(${weekCols}, minmax(0, 1fr))` }}
        >
            {weekDays.map(weekDay => (
                <span
                    key={weekDay}
                    role="columnheader"
                    aria-label={i18n.t(`Days.Full.${weekDay}`, undefined)}
                    className="tp-body-md text-fg-muted flex size-6 items-center justify-center"
                >
                    {i18n.t(`Days.Short.${weekDay}`, undefined)}
                </span>
            ))}
        </div>
    )
}

interface DayPickerWeekRowProps {
    week: Date[]
    isSelected: (day: Date) => boolean
    isDisabled: (day: Date) => boolean
    isFocused: (day: Date) => boolean
    onCellClick: (day: Date) => void
    onCellKeyDown: (event: KeyboardEvent<HTMLButtonElement>, day: Date) => void
}
const DayPickerWeekRow = (props: DayPickerWeekRowProps) => (
    <div
        role="row"
        className="grid"
        style={{ gridTemplateColumns: `repeat(${weekCols}, minmax(0, 1fr))` }}
    >
        {props.week.map(day => (
            <DayPickerDayCell
                key={day.getTime()}
                day={day}
                selected={props.isSelected(day)}
                disabled={props.isDisabled(day)}
                focused={props.isFocused(day)}
                onClick={props.onCellClick}
                onKeyDown={props.onCellKeyDown}
            />
        ))}
    </div>
)

interface DayPickerMonthCellProps {
    month: Date
    selected: boolean
    disabled: boolean
    focused: boolean
    onClick: (month: Date) => void
    onKeyDown: (event: KeyboardEvent<HTMLButtonElement>, month: Date) => void
}
const DayPickerMonthCell = (props: DayPickerMonthCellProps) => {
    const { i18n } = useUiContext()
    return (
        <button
            type="button"
            role="gridcell"
            aria-selected={props.selected}
            aria-disabled={props.disabled}
            tabIndex={props.focused ? 0 : -1}
            data-active={props.focused}
            onClick={() => {
                props.onClick(props.month)
            }}
            onKeyDown={event => {
                props.onKeyDown(event, props.month)
            }}
            className={cn("tp-body-md m-auto size-8 rounded-full transition-colors", {
                "bg-surface-inverse text-fg-inverse": props.selected,
                "hover:bg-surface-muted/50": !props.selected && !props.disabled,
                "cursor-not-allowed opacity-50": props.disabled,
            })}
        >
            {monthLabel(props.month, "short", i18n.t)}
        </button>
    )
}

interface DayPickerMonthRowProps {
    months: Date[]
    isSelected: (month: Date) => boolean
    isDisabled: (month: Date) => boolean
    isFocused: (month: Date) => boolean
    onCellClick: (month: Date) => void
    onCellKeyDown: (event: KeyboardEvent<HTMLButtonElement>, month: Date) => void
}
const DayPickerMonthRow = (props: DayPickerMonthRowProps) => (
    <div
        role="row"
        className="grid"
        style={{ gridTemplateColumns: `repeat(${monthCols}, minmax(0, 1fr))` }}
    >
        {props.months.map(month => (
            <DayPickerMonthCell
                key={month.getTime()}
                month={month}
                selected={props.isSelected(month)}
                disabled={props.isDisabled(month)}
                focused={props.isFocused(month)}
                onClick={props.onCellClick}
                onKeyDown={props.onCellKeyDown}
            />
        ))}
    </div>
)

interface DayPickerYearCellProps {
    year: Date
    selected: boolean
    disabled: boolean
    focused: boolean
    onClick: (year: Date) => void
    onKeyDown: (event: KeyboardEvent<HTMLButtonElement>, year: Date) => void
}
const DayPickerYearCell = (props: DayPickerYearCellProps) => (
    <button
        type="button"
        role="gridcell"
        aria-selected={props.selected}
        aria-disabled={props.disabled}
        tabIndex={props.focused ? 0 : -1}
        data-active={props.focused}
        onClick={() => {
            props.onClick(props.year)
        }}
        onKeyDown={event => {
            props.onKeyDown(event, props.year)
        }}
        className={cn("tp-body-md m-auto size-10 rounded-full transition-colors", {
            "bg-surface-inverse text-fg-inverse": props.selected,
            "hover:bg-surface-muted/50": !props.selected && !props.disabled,
            "cursor-not-allowed opacity-50": props.disabled,
        })}
    >
        {props.year.getFullYear()}
    </button>
)

interface DayPickerYearRowProps {
    years: Date[]
    isSelected: (year: Date) => boolean
    isDisabled: (year: Date) => boolean
    isFocused: (year: Date) => boolean
    onCellClick: (year: Date) => void
    onCellKeyDown: (event: KeyboardEvent<HTMLButtonElement>, year: Date) => void
}
const DayPickerYearRow = (props: DayPickerYearRowProps) => (
    <div
        role="row"
        className="grid"
        style={{ gridTemplateColumns: `repeat(${yearCols}, minmax(0, 1fr))` }}
    >
        {props.years.map(year => (
            <DayPickerYearCell
                key={year.getTime()}
                year={year}
                selected={props.isSelected(year)}
                disabled={props.isDisabled(year)}
                focused={props.isFocused(year)}
                onClick={props.onCellClick}
                onKeyDown={props.onCellKeyDown}
            />
        ))}
    </div>
)

export interface DayPickerProps {
    value: Date | undefined
    onValueChange: (date: Date) => void
    min?: Date
    max?: Date
    isDayDisabled?: (date: Date) => boolean
    yearStep?: number
    disabled?: boolean
    suppressFieldCallbacks?: boolean
    className?: string
    "aria-describedby"?: string
}
export const DayPicker = (props: DayPickerProps) => {
    const { i18n } = useUiContext()
    const fieldContext = useFieldContext()
    const mode = useFieldInputMode()
    const callbacks = useFieldCallbacks(props.suppressFieldCallbacks)
    const handleBlur = callbacks.onBlur
    const disabled = props.disabled ?? fieldContext?.disabled ?? false
    const ariaDescribedBy = props["aria-describedby"] ?? fieldContext?.describedByIds
    const yearStep = props.yearStep ?? 9

    // TODO: move the `new Date()` fallback out of render, then remove this directive
    // oxlint-disable-next-line react/purity
    const safeValue = props.value && isValid(props.value) ? props.value : new Date()

    const [min, max] =
        props.min && props.max && props.min > props.max
            ? [null, null]
            : [props.min, props.max]
    const isBelowMin = (date: Date) => (min ? date < min : false)
    const isAboveMax = (date: Date) => (max ? date > max : false)

    const [view, setView] = useState<DayPickerView>("day")
    const [viewDay, setViewDay] = useState(safeValue)
    const [focusedDate, setFocusedDate] = useState(safeValue)
    const onFocusedDateChange = (date: Date) => {
        flushSync(() => {
            setFocusedDate(date)
        })
        gridRef.current?.querySelector<HTMLElement>('[data-active="true"]')?.focus()
    }

    const gridRef = useRef<HTMLDivElement>(null)

    const moveFocusTo = (date: Date) => {
        setViewDay(date)
        onFocusedDateChange(date)
    }

    const onCycleView = () => {
        const newView = match(view)
            .returnType<DayPickerView>()
            .with("day", () => "month")
            .with("month", () => "year")
            .with("year", identity)
            .exhaustive()
        setView(newView)
        setFocusedDate(viewDay)
    }

    const onPrevious = () => {
        const newViewDay = match(view)
            .with("day", () => subMonths(viewDay, 1))
            .with("month", () => subYears(viewDay, 1))
            .with("year", () => subYears(viewDay, yearStep))
            .exhaustive()
        setViewDay(newViewDay)
        setFocusedDate(newViewDay)
    }

    const onNext = () => {
        const newViewDay = match(view)
            .with("day", () => addMonths(viewDay, 1))
            .with("month", () => addYears(viewDay, 1))
            .with("year", () => addYears(viewDay, yearStep))
            .exhaustive()
        setViewDay(newViewDay)
        setFocusedDate(newViewDay)
    }

    const viewYear = viewDay.getFullYear()

    const viewWeeks = chunk(
        eachDayOfInterval({
            start: startOfWeek(startOfMonth(viewDay)),
            end: endOfWeek(endOfMonth(viewDay)),
        }),
        weekCols,
    )
    const viewMonthRows = chunk(
        eachMonthOfInterval({
            start: startOfYear(viewDay),
            end: endOfYear(viewDay),
        }),
        monthCols,
    )
    const viewYears = (() => {
        const { startYear } = yearWindow(viewDay, yearStep)
        return Array.from({ length: yearStep }, (_, idx) => safeNewDate(startYear + idx))
    })()
    const viewYearRows = chunk(viewYears, yearCols)

    const viewText = match(view)
        .with("day", () => `${monthLabel(viewDay, "full", i18n.t)} ${viewYear}`)
        .with("month", () => String(viewYear))
        .with("year", () => {
            const { startYear, endYear } = yearWindow(viewDay, yearStep)
            return `${startYear} - ${endYear}`
        })
        .exhaustive()

    const [previousLabel, nextLabel] = match(view)
        .returnType<[string, string]>()
        .with("day", () => [
            i18n.t("DayPicker.PreviousMonth", undefined),
            i18n.t("DayPicker.NextMonth", undefined),
        ])
        .with("month", () => [
            i18n.t("DayPicker.PreviousYear", undefined),
            i18n.t("DayPicker.NextYear", undefined),
        ])
        .with("year", () => [
            i18n.t("DayPicker.PreviousYears", undefined),
            i18n.t("DayPicker.NextYears", undefined),
        ])
        .exhaustive()

    const [previousDisabled, nextDisabled] = match(view)
        .returnType<[boolean, boolean]>()
        .with("day", () => [
            isBelowMin(endOfMonth(subMonths(viewDay, 1))),
            isAboveMax(startOfMonth(addMonths(viewDay, 1))),
        ])
        .with("month", () => [
            isBelowMin(endOfYear(subYears(viewDay, 1))),
            isAboveMax(startOfYear(addYears(viewDay, 1))),
        ])
        .with("year", () => [
            isBelowMin(endOfYear(subYears(viewDay, yearStep))),
            isAboveMax(startOfYear(addYears(viewDay, yearStep))),
        ])
        .exhaustive()

    const isDayDisabled = (day: Date) =>
        disabled ||
        !isSameMonth(viewDay, day) ||
        isBelowMin(day) ||
        isAboveMax(day) ||
        (props.isDayDisabled ? props.isDayDisabled(day) : false)

    const onDayCellClick = (day: Date) => {
        if (isDayDisabled(day)) {
            return
        }

        props.onValueChange(day)
        callbacks.onChange()
        onFocusedDateChange(day)
    }
    const clampDay = (target: Date) => {
        if (min && target < min) {
            return min
        }
        if (max && target > max) {
            return max
        }

        return target
    }
    const findEnabledInDirection = (start: Date, direction: 1 | -1): Date | null => {
        if (!isValid(start)) {
            return null
        }

        const scanBound =
            direction === 1
                ? addYears(start, maxScanYears)
                : subYears(start, maxScanYears)
        let current = start
        while (!isBelowMin(current) && !isAboveMax(current)) {
            if (direction === 1 ? current > scanBound : current < scanBound) {
                return null
            }
            if (!(props.isDayDisabled ? props.isDayDisabled(current) : false)) {
                return current
            }
            current = addDays(current, direction)
        }
        return null
    }

    const onDayCellKeyDown = (event: KeyboardEvent<HTMLButtonElement>, day: Date) => {
        const move = match(event.key)
            .returnType<{ next: Date; direction: 1 | -1 } | null>()
            .with("ArrowLeft", () => ({ next: subDays(day, 1), direction: -1 }))
            .with("ArrowRight", () => ({ next: addDays(day, 1), direction: 1 }))
            .with("ArrowUp", () => ({ next: subWeeks(day, 1), direction: -1 }))
            .with("ArrowDown", () => ({ next: addWeeks(day, 1), direction: 1 }))
            .with("Home", () => ({ next: startOfWeek(day), direction: -1 }))
            .with("End", () => ({ next: endOfWeek(day), direction: 1 }))
            .with("PageUp", () => ({
                next: event.shiftKey ? subYears(day, 1) : subMonths(day, 1),
                direction: -1,
            }))
            .with("PageDown", () => ({
                next: event.shiftKey ? addYears(day, 1) : addMonths(day, 1),
                direction: 1,
            }))
            .otherwise(() => null)
        if (move === null) {
            return
        }

        event.preventDefault()
        moveFocusTo(findEnabledInDirection(clampDay(move.next), move.direction) ?? day)
    }

    const onMonthCellClick = (month: Date) => {
        const monthStart = startOfMonth(month)
        const cellDisabled =
            disabled || isBelowMin(endOfMonth(month)) || isAboveMax(monthStart)
        if (cellDisabled) {
            return
        }

        setView("day")
        setViewDay(monthStart)
        onFocusedDateChange(monthStart)
    }
    const clampMonth = (target: Date) => {
        if (min && isBelowMin(endOfMonth(target))) {
            return startOfMonth(min)
        }
        if (max && isAboveMax(startOfMonth(target))) {
            return startOfMonth(max)
        }

        return target
    }
    const onMonthCellKeyDown = (event: KeyboardEvent<HTMLButtonElement>, month: Date) => {
        const monthIndex = month.getMonth()
        const rowStartMonth = Math.floor(monthIndex / monthCols) * monthCols
        const next = match(event.key)
            .returnType<Date | null>()
            .with("ArrowLeft", () => subMonths(month, 1))
            .with("ArrowRight", () => addMonths(month, 1))
            .with("ArrowUp", () => subMonths(month, monthCols))
            .with("ArrowDown", () => addMonths(month, monthCols))
            .with("Home", () => safeNewDate(month.getFullYear(), rowStartMonth))
            .with("End", () =>
                safeNewDate(month.getFullYear(), rowStartMonth + monthCols - 1),
            )
            .with("PageUp", () => subYears(month, event.shiftKey ? 10 : 1))
            .with("PageDown", () => addYears(month, event.shiftKey ? 10 : 1))
            .otherwise(() => null)
        if (next === null) {
            return
        }

        event.preventDefault()
        moveFocusTo(clampMonth(next))
    }

    const onYearCellClick = (year: Date) => {
        const yearStart = startOfYear(year)
        const cellDisabled =
            disabled || isBelowMin(endOfYear(year)) || isAboveMax(yearStart)
        if (cellDisabled) {
            return
        }

        setView("month")
        setViewDay(yearStart)
        onFocusedDateChange(yearStart)
    }
    const clampYear = (target: Date) => {
        if (min && isBelowMin(endOfYear(target))) {
            return startOfYear(min)
        }
        if (max && isAboveMax(startOfYear(target))) {
            return startOfYear(max)
        }
        return target
    }
    const onYearCellKeyDown = (event: KeyboardEvent<HTMLButtonElement>, year: Date) => {
        const yearVal = year.getFullYear()
        const { startYear, endYear } = yearWindow(year, yearStep)
        const rowStart =
            startYear + Math.floor((yearVal - startYear) / yearCols) * yearCols
        const next = match(event.key)
            .returnType<Date | null>()
            .with("ArrowLeft", () => safeNewDate(yearVal - 1))
            .with("ArrowRight", () => safeNewDate(yearVal + 1))
            .with("ArrowUp", () => safeNewDate(yearVal - yearCols))
            .with("ArrowDown", () => safeNewDate(yearVal + yearCols))
            .with("Home", () => safeNewDate(rowStart))
            .with("End", () => safeNewDate(Math.min(rowStart + yearCols - 1, endYear)))
            .with("PageUp", () => safeNewDate(yearVal - yearStep))
            .with("PageDown", () => safeNewDate(yearVal + yearStep))
            .otherwise(() => null)
        if (next === null) {
            return
        }

        event.preventDefault()
        moveFocusTo(clampYear(next))
    }

    const matchesDay = (day: Date) =>
        isDefined(props.value) && isValid(props.value) && isSameDay(props.value, day)
    const matchesMonth = (month: Date) =>
        isDefined(props.value) && isValid(props.value) && isSameMonth(props.value, month)
    const matchesYear = (year: Date) =>
        isDefined(props.value) && isValid(props.value) && isSameYear(props.value, year)

    // Resolves the cell carrying `tabIndex=0` in the current view. A `focusedDate`
    // outside the visible period falls back to the first cell of that period, so
    // tabbing into the grid always lands somewhere.
    const activeFocusedDate = match(view)
        .with("day", () =>
            isSameMonth(focusedDate, viewDay) ? focusedDate : startOfMonth(viewDay),
        )
        .with("month", () =>
            isSameYear(focusedDate, viewDay)
                ? focusedDate
                : safeNewDate(viewDay.getFullYear()),
        )
        .with("year", () => {
            const { startYear, endYear } = yearWindow(viewDay, yearStep)
            const focusedYear = focusedDate.getFullYear()
            return focusedYear >= startYear && focusedYear <= endYear
                ? focusedDate
                : safeNewDate(startYear)
        })
        .exhaustive()

    const isDayFocused = (day: Date) => isSameDay(day, activeFocusedDate)

    const isMonthDisabled = (month: Date) =>
        disabled || isBelowMin(endOfMonth(month)) || isAboveMax(startOfMonth(month))
    const isMonthFocused = (month: Date) => isSameMonth(activeFocusedDate, month)

    const isYearDisabled = (year: Date) =>
        disabled || isBelowMin(endOfYear(year)) || isAboveMax(startOfYear(year))
    const isYearFocused = (year: Date) => isSameYear(activeFocusedDate, year)

    if (mode === "view") {
        return (
            <InputView className={props.className}>
                {isDefined(props.value) &&
                    formatDate(props.value, {
                        template: "PPP",
                        locale: i18n.dateFns.locale,
                    })}
            </InputView>
        )
    }

    return (
        // SAFETY: the group holds the blur handler, because a cell keeps the focus inside
        // oxlint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
        <div
            role="group"
            aria-labelledby={fieldContext?.labelId}
            aria-describedby={ariaDescribedBy}
            aria-disabled={disabled || undefined}
            onBlur={handleBlur}
            className={cn(
                "border-line-muted flex w-[12.5rem] flex-col rounded-lg border p-2",
                { "opacity-50": disabled },
                props.className,
            )}
        >
            <div className="flex items-center justify-between">
                <button
                    type="button"
                    onClick={onPrevious}
                    disabled={previousDisabled || disabled}
                    aria-label={previousLabel}
                    className="text-fg flex w-fit justify-start disabled:opacity-50"
                >
                    <IconChevronRight className="size-4 rotate-180" />
                </button>
                {(view === "day" || view === "month") && (
                    <button
                        type="button"
                        className="tp-body-md flex items-center justify-center"
                        onClick={onCycleView}
                        disabled={disabled}
                        aria-live="polite"
                    >
                        {viewText}
                    </button>
                )}
                {view === "year" && (
                    <span
                        className="tp-body-md flex items-center justify-center"
                        aria-live="polite"
                    >
                        {viewText}
                    </span>
                )}
                <button
                    type="button"
                    onClick={onNext}
                    disabled={nextDisabled || disabled}
                    aria-label={nextLabel}
                    className="text-fg flex w-fit justify-end disabled:opacity-50"
                >
                    <IconChevronRight className="size-4" />
                </button>
            </div>

            {view === "day" && (
                <div ref={gridRef} role="grid" aria-label={viewText}>
                    <DayPickerWeekDayHeaderRow />
                    {viewWeeks.map(week => {
                        const [firstDay] = week
                        if (!firstDay) {
                            return null
                        }
                        return (
                            <DayPickerWeekRow
                                key={firstDay.getTime()}
                                week={week}
                                isSelected={matchesDay}
                                isDisabled={isDayDisabled}
                                isFocused={isDayFocused}
                                onCellClick={onDayCellClick}
                                onCellKeyDown={onDayCellKeyDown}
                            />
                        )
                    })}
                </div>
            )}

            {view === "month" && (
                <div ref={gridRef} role="grid" aria-label={viewText}>
                    {viewMonthRows.map(row => {
                        const [firstMonth] = row
                        if (!firstMonth) {
                            return null
                        }
                        return (
                            <DayPickerMonthRow
                                key={firstMonth.getTime()}
                                months={row}
                                isSelected={matchesMonth}
                                isDisabled={isMonthDisabled}
                                isFocused={isMonthFocused}
                                onCellClick={onMonthCellClick}
                                onCellKeyDown={onMonthCellKeyDown}
                            />
                        )
                    })}
                </div>
            )}

            {view === "year" && (
                <div ref={gridRef} role="grid" aria-label={viewText}>
                    {viewYearRows.map(row => {
                        const [firstYear] = row
                        if (!firstYear) {
                            return null
                        }
                        return (
                            <DayPickerYearRow
                                key={firstYear.getTime()}
                                years={row}
                                isSelected={matchesYear}
                                isDisabled={isYearDisabled}
                                isFocused={isYearFocused}
                                onCellClick={onYearCellClick}
                                onCellKeyDown={onYearCellKeyDown}
                            />
                        )
                    })}
                </div>
            )}
        </div>
    )
}
