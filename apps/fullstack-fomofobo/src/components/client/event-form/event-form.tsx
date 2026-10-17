"use client"

import { identity } from "es-toolkit"
import type { FormErrors } from "frontend-shared/types"
import type { Category } from "models"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import type { WeekDay } from "shared/temporal"
import { isoDate, weekDays } from "shared/temporal"
import { Alert } from "ui-components/alert"
import { Button } from "ui-components/button"
import { Checkbox } from "ui-components/checkbox"
import { Combobox } from "ui-components/combobox"
import { DateInput } from "ui-components/date-input"
import { Field } from "ui-components/field"
import { PixelIcon } from "ui-components/pixel-icons"
import { Select } from "ui-components/select"
import { StringInput } from "ui-components/string-input"
import { Textarea } from "ui-components/textarea"
import { TimeInput } from "ui-components/time-input"

import { expandOccurrences } from "@/lib/events/expand-occurrences"
import { PLATFORM_TIME_ZONE } from "@/lib/platform/platform"

import type {
    EventFormAction,
    EventFormOption,
    EventFormState,
    EventMonthlyMode,
    EventRepeat,
} from "./event-form.state"
import { eventFormReducer, localDateTimeOf } from "./event-form.state"

const REPEATS: EventRepeat[] = ["single", "weekly", "monthly"]
const MONTHLY_MODES: EventMonthlyMode[] = ["day-of-month", "weekday-position"]
// Monday first, the Italian week
const WEEK: WeekDay[] = [...weekDays.slice(1), "sunday"]

interface EventFormProps {
    value: EventFormState
    onValueChange: (value: EventFormState) => void
    errors: FormErrors<EventFormState> | undefined
    categories: Category[]
    venues: EventFormOption[]
    organizers: EventFormOption[] | undefined
    disabled?: boolean
}

export const EventForm = (props: EventFormProps) => {
    const { t } = useTranslation("shared")
    const [addedDate, setAddedDate] = useState<Date | undefined>(undefined)
    const value = props.value
    const repeat = value.repeat ?? "single"

    const onAction = (action: EventFormAction) => {
        props.onValueChange(eventFormReducer(value, action))
    }

    const selectedCategories = props.categories.filter(category =>
        (value.categoryIds ?? []).includes(category.id),
    )
    const startsAt = localDateTimeOf(value.startDate, value.startTime)
    const endsAt = localDateTimeOf(value.endDate, value.endTime)
    const until = value.until === undefined ? undefined : isoDate(value.until)
    const removedDates = value.removedDates ?? []
    const addedDates = value.addedDates ?? []
    // The removed dates stay in the preview, so a removal can be undone
    const preview =
        startsAt === undefined || endsAt === undefined
            ? undefined
            : expandOccurrences(
                  {
                      startsAt,
                      endsAt,
                      recurrence:
                          repeat === "single" || until === undefined
                              ? null
                              : {
                                    rule:
                                        repeat === "weekly"
                                            ? {
                                                  frequency: "weekly",
                                                  weekdays: value.weekdays ?? [],
                                                  until,
                                              }
                                            : {
                                                  frequency: "monthly",
                                                  mode:
                                                      value.monthlyMode ?? "day-of-month",
                                                  until,
                                              },
                                    addedDates,
                                    removedDates: [],
                                },
                  },
                  PLATFORM_TIME_ZONE,
              )
    const previewDates = preview?.success === true ? preview.value : []
    const activeCount = previewDates.filter(
        occurrence => !removedDates.includes(occurrence.localDate),
    ).length

    return (
        <>
            <Field
                label={t("Backoffice.EventForm.Title")}
                required={true}
                errors={props.errors?.title?.errors}
            >
                <StringInput
                    value={value.title}
                    onValueChange={title => {
                        onAction({ type: "title", value: title })
                    }}
                    disabled={props.disabled}
                />
            </Field>
            {/* PLACEHOLDER(OP-12): a short optional text */}
            <Field
                label={t("Backoffice.EventForm.Description")}
                required={false}
                errors={props.errors?.description?.errors}
            >
                <Textarea
                    value={value.description}
                    onValueChange={description => {
                        onAction({ type: "description", value: description })
                    }}
                    disabled={props.disabled}
                />
            </Field>
            <Field
                label={t("Backoffice.EventForm.Categories")}
                required={true}
                errors={props.errors?.categoryIds?.errors}
            >
                <Combobox
                    type="standard"
                    async={false}
                    multiple={true}
                    resettable={false}
                    items={props.categories}
                    value={selectedCategories}
                    onValueChange={categories => {
                        onAction({
                            type: "category-ids",
                            value: categories.map(category => category.id),
                        })
                    }}
                    getItemId={category => category.id}
                    getItemLabel={category => category.name}
                    renderItem={({ item }) => (
                        <span className="flex items-center gap-2">
                            <PixelIcon name={item.icon} className="size-4" />
                            {item.name}
                        </span>
                    )}
                    disabled={props.disabled}
                    className="w-full"
                />
            </Field>
            {/* PLACEHOLDER(OP-11): the category of the pin */}
            <Field
                label={t("Backoffice.EventForm.PrimaryCategory")}
                description={t("Backoffice.EventForm.PrimaryCategoryHint")}
                required={true}
                errors={props.errors?.primaryCategoryId?.errors}
            >
                <Select
                    multiple={false}
                    resettable={false}
                    items={selectedCategories}
                    getItemId={category => category.id}
                    renderItem={({ item }) => item.name}
                    value={selectedCategories.find(
                        category => category.id === value.primaryCategoryId,
                    )}
                    onValueChange={category => {
                        onAction({ type: "primary-category-id", value: category?.id })
                    }}
                    disabled={props.disabled}
                />
            </Field>
            <Field
                label={t("Backoffice.EventForm.Venue")}
                required={true}
                errors={props.errors?.venue?.errors}
            >
                <Combobox
                    type="standard"
                    async={false}
                    multiple={false}
                    resettable={false}
                    items={props.venues}
                    value={value.venue}
                    onValueChange={venue => {
                        onAction({ type: "venue", value: venue })
                    }}
                    getItemId={venue => venue.id}
                    getItemLabel={venue => venue.name}
                    renderItem={({ item }) => item.name}
                    disabled={props.disabled}
                    className="w-full"
                />
            </Field>
            {/* PLACEHOLDER(OP-21, TQ-18): an Admin picks an organizer account */}
            {props.organizers !== undefined && (
                <Field
                    label={t("Backoffice.EventForm.Organizer")}
                    required={true}
                    errors={props.errors?.organizer?.errors}
                >
                    <Combobox
                        type="standard"
                        async={false}
                        multiple={false}
                        resettable={false}
                        items={props.organizers}
                        value={value.organizer}
                        onValueChange={organizer => {
                            onAction({ type: "organizer", value: organizer })
                        }}
                        getItemId={organizer => organizer.id}
                        getItemLabel={organizer => organizer.name}
                        renderItem={({ item }) => item.name}
                        disabled={props.disabled}
                        className="w-full"
                    />
                </Field>
            )}
            <div className="grid grid-cols-2 gap-3">
                <Field
                    label={t("Backoffice.EventForm.StartDate")}
                    required={true}
                    errors={props.errors?.startDate?.errors}
                >
                    <DateInput
                        mode="native"
                        value={value.startDate}
                        onValueChange={date => {
                            onAction({ type: "start-date", value: date })
                        }}
                        disabled={props.disabled}
                    />
                </Field>
                <Field label={t("Backoffice.EventForm.StartTime")} required={true}>
                    <TimeInput
                        value={value.startTime}
                        onValueChange={time => {
                            onAction({ type: "start-time", value: time })
                        }}
                        disabled={props.disabled}
                    />
                </Field>
                <Field
                    label={t("Backoffice.EventForm.EndDate")}
                    description={t("Backoffice.EventForm.EndDateHint")}
                    required={true}
                    errors={props.errors?.endDate?.errors}
                >
                    <DateInput
                        mode="native"
                        value={value.endDate}
                        onValueChange={date => {
                            onAction({ type: "end-date", value: date })
                        }}
                        disabled={props.disabled}
                    />
                </Field>
                <Field label={t("Backoffice.EventForm.EndTime")} required={true}>
                    <TimeInput
                        value={value.endTime}
                        onValueChange={time => {
                            onAction({ type: "end-time", value: time })
                        }}
                        disabled={props.disabled}
                    />
                </Field>
            </div>
            <Field label={t("Backoffice.EventForm.Repeat")} required={true}>
                <Select
                    multiple={false}
                    resettable={false}
                    items={REPEATS}
                    getItemId={identity}
                    renderItem={({ item }) => t(`Backoffice.EventForm.Repeats.${item}`)}
                    value={repeat}
                    onValueChange={nextRepeat => {
                        onAction({ type: "repeat", value: nextRepeat })
                    }}
                    disabled={props.disabled}
                />
            </Field>
            {repeat === "weekly" && (
                <Field
                    label={t("Backoffice.EventForm.Weekdays")}
                    required={true}
                    errors={props.errors?.weekdays?.errors}
                >
                    <div className="flex flex-wrap gap-3">
                        {WEEK.map(weekday => (
                            <Field
                                key={weekday}
                                label={t(`Backoffice.EventForm.Weekday.${weekday}`)}
                                labelSide="right"
                                required={false}
                            >
                                <Checkbox
                                    value={(value.weekdays ?? []).includes(weekday)}
                                    onValueChange={checked => {
                                        const others = (value.weekdays ?? []).filter(
                                            day => day !== weekday,
                                        )
                                        onAction({
                                            type: "weekdays",
                                            value: checked
                                                ? [...others, weekday]
                                                : others,
                                        })
                                    }}
                                    disabled={props.disabled}
                                />
                            </Field>
                        ))}
                    </div>
                </Field>
            )}
            {/* OP-15: on the day of the month, or on the nth weekday */}
            {repeat === "monthly" && (
                <Field label={t("Backoffice.EventForm.MonthlyMode")} required={true}>
                    <Select
                        multiple={false}
                        resettable={false}
                        items={MONTHLY_MODES}
                        getItemId={identity}
                        renderItem={({ item }) =>
                            t(`Backoffice.EventForm.MonthlyModes.${item}`)
                        }
                        value={value.monthlyMode ?? "day-of-month"}
                        onValueChange={mode => {
                            onAction({ type: "monthly-mode", value: mode })
                        }}
                        disabled={props.disabled}
                    />
                </Field>
            )}
            {repeat !== "single" && (
                <>
                    <Field
                        label={t("Backoffice.EventForm.Until")}
                        required={true}
                        errors={props.errors?.until?.errors}
                    >
                        <DateInput
                            mode="native"
                            value={value.until}
                            onValueChange={date => {
                                onAction({ type: "until", value: date })
                            }}
                            disabled={props.disabled}
                        />
                    </Field>
                    <Field
                        label={t("Backoffice.EventForm.AddedDate")}
                        required={false}
                        errors={props.errors?.addedDates?.errors}
                    >
                        <div className="flex flex-wrap items-center gap-2">
                            <DateInput
                                mode="native"
                                value={addedDate}
                                onValueChange={setAddedDate}
                                disabled={props.disabled}
                            />
                            <Button
                                variant="secondary"
                                size="sm"
                                disabled={
                                    props.disabled === true || addedDate === undefined
                                }
                                onClick={() => {
                                    if (addedDate === undefined) {
                                        return
                                    }
                                    const date = isoDate(addedDate)
                                    onAction({
                                        type: "added-dates",
                                        value: [
                                            ...addedDates.filter(item => item !== date),
                                            date,
                                        ].toSorted(),
                                    })
                                    setAddedDate(undefined)
                                }}
                            >
                                {t("Backoffice.EventForm.AddDate")}
                            </Button>
                        </div>
                    </Field>
                </>
            )}
            <section
                aria-label={t("Backoffice.EventForm.Preview")}
                className="flex flex-col gap-2"
            >
                <h2 className="tp-pixel-md">{t("Backoffice.EventForm.Preview")}</h2>
                {preview === undefined && (
                    <p className="tp-body-sm">{t("Backoffice.EventForm.PreviewEmpty")}</p>
                )}
                {preview?.success === false && (
                    <Alert
                        type="error"
                        text={t("Backoffice.Errors.TooManyOccurrences")}
                    />
                )}
                {preview?.success === true && (
                    <>
                        <p className="tp-body-sm">
                            {t("Backoffice.EventForm.PreviewCount", {
                                count: activeCount,
                            })}
                        </p>
                        <ul className="flex max-h-72 flex-col gap-1 overflow-auto">
                            {previewDates.map(occurrence => {
                                const removed = removedDates.includes(
                                    occurrence.localDate,
                                )
                                const added = addedDates.includes(occurrence.localDate)
                                return (
                                    <li
                                        key={occurrence.localDate}
                                        className="flex items-center justify-between gap-2"
                                    >
                                        <span
                                            className={
                                                removed ? "line-through" : undefined
                                            }
                                        >
                                            {occurrence.localDate}
                                        </span>
                                        {repeat !== "single" && (
                                            <Button
                                                variant="tertiary"
                                                size="sm"
                                                disabled={props.disabled}
                                                aria-label={t(
                                                    removed
                                                        ? "Backoffice.EventForm.RestoreDate"
                                                        : "Backoffice.EventForm.RemoveDate",
                                                    { date: occurrence.localDate },
                                                )}
                                                onClick={() => {
                                                    onAction(
                                                        added
                                                            ? {
                                                                  type: "added-dates",
                                                                  value: addedDates.filter(
                                                                      date =>
                                                                          date !==
                                                                          occurrence.localDate,
                                                                  ),
                                                              }
                                                            : {
                                                                  type: "removed-dates",
                                                                  value: removed
                                                                      ? removedDates.filter(
                                                                            date =>
                                                                                date !==
                                                                                occurrence.localDate,
                                                                        )
                                                                      : [
                                                                            ...removedDates,
                                                                            occurrence.localDate,
                                                                        ].toSorted(),
                                                              },
                                                    )
                                                }}
                                            >
                                                {removed
                                                    ? t("Backoffice.EventForm.Restore")
                                                    : t("Backoffice.Actions.Delete")}
                                            </Button>
                                        )}
                                    </li>
                                )
                            })}
                        </ul>
                    </>
                )}
            </section>
            {/* OP-14: an empty price reads "Gratis" in the public app */}
            <Field
                label={t("Backoffice.EventForm.Price")}
                description={t("Backoffice.EventForm.PriceHint")}
                required={false}
                errors={props.errors?.price?.errors}
            >
                <StringInput
                    value={value.price}
                    onValueChange={price => {
                        onAction({ type: "price", value: price })
                    }}
                    disabled={props.disabled}
                />
            </Field>
            <Field
                label={t("Backoffice.EventForm.Instagram")}
                required={false}
                errors={props.errors?.instagramUrl?.errors}
            >
                <StringInput
                    type="url"
                    value={value.instagramUrl}
                    onValueChange={url => {
                        onAction({ type: "instagram-url", value: url })
                    }}
                    disabled={props.disabled}
                />
            </Field>
            <Field
                label={t("Backoffice.EventForm.Facebook")}
                required={false}
                errors={props.errors?.facebookUrl?.errors}
            >
                <StringInput
                    type="url"
                    value={value.facebookUrl}
                    onValueChange={url => {
                        onAction({ type: "facebook-url", value: url })
                    }}
                    disabled={props.disabled}
                />
            </Field>
        </>
    )
}
