import {
    addMonths,
    format,
    isAfter,
    isBefore,
    isSameDay,
    isToday,
    startOfDay,
    startOfMonth,
} from "date-fns"
import { useState } from "react"
import { useDateFnsLocale } from "react-i18n/hooks"
import { useTranslation } from "react-i18next"
import { Pressable, View } from "react-native"

import { IconButton } from "@/components/ui/icon-button/icon-button"
import { Text } from "@/components/ui/text/text"
import { cn } from "@/lib/utils/class-names"

import type { DateRange } from "./date-range"
import { monthWeeks, nextDateRange } from "./date-range"
import {
    dateRangeDayTextVariants,
    dateRangeDayVariants,
    dateRangeEmptyStyles,
    dateRangeHeaderStyles,
    dateRangeMonthStyles,
    dateRangePickerStyles,
    dateRangeWeekStyles,
    dateRangeWeekdayStyles,
} from "./date-range-picker.styles"

interface DateRangePickerProps {
    defaultValue?: DateRange
    onValueChange: (range: DateRange) => void
    minDate?: Date
    className?: string
}

/**
 * @description Returns the look of a day cell for the selected range
 * @param day Day of the cell
 * @param range Selected range
 */
const dayState = (day: Date, range: DateRange) => {
    const endpoint =
        (range.from !== undefined && isSameDay(day, range.from)) ||
        (range.to !== undefined && isSameDay(day, range.to))
    const inside =
        range.from !== undefined &&
        range.to !== undefined &&
        isAfter(day, range.from) &&
        isBefore(day, range.to)
    return endpoint ? "endpoint" : inside ? "inside" : isToday(day) ? "today" : "plain"
}

const DateRangePicker = (props: DateRangePickerProps) => {
    const { t } = useTranslation("ui")
    const locale = useDateFnsLocale()
    const firstMonth =
        props.minDate === undefined ? undefined : startOfMonth(props.minDate)
    // Holds its own range: inside a bottom sheet the props reach the content one render late
    const [range, setRange] = useState<DateRange>(props.defaultValue ?? {})
    const [month, setMonth] = useState(() =>
        startOfMonth(range.from ?? props.minDate ?? new Date()),
    )
    const weeks = monthWeeks(month, locale)
    const weekdays = weeks.find(week => week.every(day => day !== undefined)) ?? []

    return (
        <View className={cn(dateRangePickerStyles, props.className)}>
            <View className={dateRangeHeaderStyles}>
                <IconButton
                    icon="back"
                    size="sm"
                    label={t("DateRangePicker.PreviousMonth")}
                    disabled={firstMonth !== undefined && !isAfter(month, firstMonth)}
                    onPress={() => {
                        setMonth(addMonths(month, -1))
                    }}
                />
                <Text accessibilityRole="header" className={dateRangeMonthStyles}>
                    {format(month, "LLLL yyyy", { locale })}
                </Text>
                <IconButton
                    icon="back"
                    mirrored={true}
                    size="sm"
                    label={t("DateRangePicker.NextMonth")}
                    onPress={() => {
                        setMonth(addMonths(month, 1))
                    }}
                />
            </View>
            <View
                className={dateRangeWeekStyles}
                importantForAccessibility="no-hide-descendants"
            >
                {weekdays.map(day => (
                    <Text key={day.toISOString()} className={dateRangeWeekdayStyles}>
                        {format(day, "EEEEEE", { locale })}
                    </Text>
                ))}
            </View>
            {weeks.map(week => (
                <View
                    key={week.find(day => day !== undefined)?.toISOString()}
                    className={dateRangeWeekStyles}
                >
                    {week.map((day, index) => {
                        if (day === undefined) {
                            // oxlint-disable-next-line react/no-array-index-key -- an empty cell has no other identity
                            return <View key={index} className={dateRangeEmptyStyles} />
                        }
                        const disabled =
                            props.minDate !== undefined &&
                            isBefore(day, startOfDay(props.minDate))
                        const state = dayState(day, range)
                        return (
                            <Pressable
                                key={day.toISOString()}
                                accessibilityRole="button"
                                accessibilityLabel={format(day, "EEEE d MMMM yyyy", {
                                    locale,
                                })}
                                accessibilityState={{
                                    selected: state === "endpoint",
                                    disabled,
                                }}
                                disabled={disabled}
                                onPress={() => {
                                    const next = nextDateRange(range, day)
                                    setRange(next)
                                    props.onValueChange(next)
                                }}
                                className={dateRangeDayVariants({ state })}
                            >
                                <Text
                                    className={dateRangeDayTextVariants({
                                        state,
                                        disabled,
                                    })}
                                >
                                    {format(day, "d", { locale })}
                                </Text>
                            </Pressable>
                        )
                    })}
                </View>
            ))}
        </View>
    )
}

export { DateRangePicker }
export type { DateRange }
