import type { Action, FormErrors, FormResult } from "frontend-shared/types"
import type { i18n as I18nInstance } from "i18next"
import type { Event, EventUpsert } from "models"
import { eventUpsertSchema } from "models"
import { err, ok } from "shared/result"
import type { Time, WeekDay } from "shared/temporal"
import { dateFromIso, isoDate, isoTime, timeFromString } from "shared/temporal"
import type { Partial, Specified } from "shared/types"
import { match } from "ts-pattern"
import { z } from "zod"

import { parseFormState } from "@/lib/forms/forms"

//#region Types

export type EventRepeat = "single" | "weekly" | "monthly"

export type EventMonthlyMode = "day-of-month" | "weekday-position"

export interface EventFormOption {
    id: string
    name: string
}

export interface EventFormPhoto {
    key: string
    url: string
}

export interface EventFormState {
    title: string | undefined
    description: string | undefined
    categoryIds: string[] | undefined
    primaryCategoryId: string | undefined
    venue: EventFormOption | undefined
    organizer: EventFormOption | undefined
    startDate: Date | undefined
    startTime: Time | undefined
    endDate: Date | undefined
    endTime: Time | undefined
    repeat: EventRepeat | undefined
    weekdays: WeekDay[] | undefined
    monthlyMode: EventMonthlyMode | undefined
    until: Date | undefined
    addedDates: string[] | undefined
    removedDates: string[] | undefined
    photos: EventFormPhoto[] | undefined
    price: string | undefined
    instagramUrl: string | undefined
    facebookUrl: string | undefined
}

export type EventFormAction =
    | { type: "title"; value: string | undefined }
    | { type: "description"; value: string | undefined }
    | { type: "category-ids"; value: string[] | undefined }
    | { type: "primary-category-id"; value: string | undefined }
    | { type: "venue"; value: EventFormOption | undefined }
    | { type: "organizer"; value: EventFormOption | undefined }
    | { type: "start-date"; value: Date | undefined }
    | { type: "start-time"; value: Time | undefined }
    | { type: "end-date"; value: Date | undefined }
    | { type: "end-time"; value: Time | undefined }
    | { type: "repeat"; value: EventRepeat | undefined }
    | { type: "weekdays"; value: WeekDay[] | undefined }
    | { type: "monthly-mode"; value: EventMonthlyMode | undefined }
    | { type: "until"; value: Date | undefined }
    | { type: "added-dates"; value: string[] | undefined }
    | { type: "removed-dates"; value: string[] | undefined }
    | { type: "photos"; value: EventFormPhoto[] | undefined }
    | { type: "price"; value: string | undefined }
    | { type: "instagram-url"; value: string | undefined }
    | { type: "facebook-url"; value: string | undefined }

//#endregion

//#region Initial State

export const initialEventFormState = (): EventFormState => ({
    title: undefined,
    description: undefined,
    categoryIds: undefined,
    primaryCategoryId: undefined,
    venue: undefined,
    organizer: undefined,
    startDate: undefined,
    startTime: undefined,
    endDate: undefined,
    endTime: undefined,
    repeat: undefined,
    weekdays: undefined,
    monthlyMode: undefined,
    until: undefined,
    addedDates: undefined,
    removedDates: undefined,
    photos: undefined,
    price: undefined,
    instagramUrl: undefined,
    facebookUrl: undefined,
})

/**
 * @description Builds the form state of a stored event
 * @param event Event edited
 */
export const eventFormStateFromEvent = (event: Event): EventFormState => {
    const rule = event.recurrence?.rule
    return {
        title: event.title,
        description: event.description ?? undefined,
        categoryIds: event.categoryIds,
        primaryCategoryId: event.primaryCategoryId,
        venue: { id: event.venue.id, name: event.venue.name },
        organizer: event.organizer,
        startDate: dateFromIso(event.startsAt.slice(0, 10)),
        startTime: timeFromString(event.startsAt.slice(11, 16)),
        endDate: dateFromIso(event.endsAt.slice(0, 10)),
        endTime: timeFromString(event.endsAt.slice(11, 16)),
        repeat: rule?.frequency ?? "single",
        weekdays: rule?.frequency === "weekly" ? rule.weekdays : undefined,
        monthlyMode: rule?.frequency === "monthly" ? rule.mode : undefined,
        until: rule === undefined ? undefined : dateFromIso(rule.until),
        addedDates: event.recurrence?.addedDates,
        removedDates: event.recurrence?.removedDates,
        photos: event.photos.map(photo => ({ key: photo.key, url: photo.url })),
        price: event.price ?? undefined,
        instagramUrl: event.externalLinks.instagramUrl ?? undefined,
        facebookUrl: event.externalLinks.facebookUrl ?? undefined,
    }
}

//#endregion

//#region Actions

const titleAction =
    (state: EventFormState) => (action: Action<EventFormAction, "title">) => ({
        ...state,
        title: action.value,
    })

const descriptionAction =
    (state: EventFormState) => (action: Action<EventFormAction, "description">) => ({
        ...state,
        description: action.value,
    })

const categoryIdsAction =
    (state: EventFormState) => (action: Action<EventFormAction, "category-ids">) => ({
        ...state,
        categoryIds: action.value,
        primaryCategoryId:
            state.primaryCategoryId !== undefined &&
            (action.value ?? []).includes(state.primaryCategoryId)
                ? state.primaryCategoryId
                : action.value?.[0],
    })

const primaryCategoryIdAction =
    (state: EventFormState) =>
    (action: Action<EventFormAction, "primary-category-id">) => ({
        ...state,
        primaryCategoryId: action.value,
    })

const venueAction =
    (state: EventFormState) => (action: Action<EventFormAction, "venue">) => ({
        ...state,
        venue: action.value,
    })

const organizerAction =
    (state: EventFormState) => (action: Action<EventFormAction, "organizer">) => ({
        ...state,
        organizer: action.value,
    })

const startDateAction =
    (state: EventFormState) => (action: Action<EventFormAction, "start-date">) => ({
        ...state,
        startDate: action.value,
        endDate: state.endDate ?? action.value,
    })

const startTimeAction =
    (state: EventFormState) => (action: Action<EventFormAction, "start-time">) => ({
        ...state,
        startTime: action.value,
    })

const endDateAction =
    (state: EventFormState) => (action: Action<EventFormAction, "end-date">) => ({
        ...state,
        endDate: action.value,
    })

const endTimeAction =
    (state: EventFormState) => (action: Action<EventFormAction, "end-time">) => ({
        ...state,
        endTime: action.value,
    })

const repeatAction =
    (state: EventFormState) => (action: Action<EventFormAction, "repeat">) => ({
        ...state,
        repeat: action.value,
    })

const weekdaysAction =
    (state: EventFormState) => (action: Action<EventFormAction, "weekdays">) => ({
        ...state,
        weekdays: action.value,
    })

const monthlyModeAction =
    (state: EventFormState) => (action: Action<EventFormAction, "monthly-mode">) => ({
        ...state,
        monthlyMode: action.value,
    })

const untilAction =
    (state: EventFormState) => (action: Action<EventFormAction, "until">) => ({
        ...state,
        until: action.value,
    })

const addedDatesAction =
    (state: EventFormState) => (action: Action<EventFormAction, "added-dates">) => ({
        ...state,
        addedDates: action.value,
    })

const removedDatesAction =
    (state: EventFormState) => (action: Action<EventFormAction, "removed-dates">) => ({
        ...state,
        removedDates: action.value,
    })

const photosAction =
    (state: EventFormState) => (action: Action<EventFormAction, "photos">) => ({
        ...state,
        photos: action.value,
    })

const priceAction =
    (state: EventFormState) => (action: Action<EventFormAction, "price">) => ({
        ...state,
        price: action.value,
    })

const instagramUrlAction =
    (state: EventFormState) => (action: Action<EventFormAction, "instagram-url">) => ({
        ...state,
        instagramUrl: action.value,
    })

const facebookUrlAction =
    (state: EventFormState) => (action: Action<EventFormAction, "facebook-url">) => ({
        ...state,
        facebookUrl: action.value,
    })

//#endregion

//#region Reducer

export const eventFormReducer = (
    state: EventFormState,
    action: EventFormAction,
): EventFormState =>
    match(action)
        .with({ type: "title" }, titleAction(state))
        .with({ type: "description" }, descriptionAction(state))
        .with({ type: "category-ids" }, categoryIdsAction(state))
        .with({ type: "primary-category-id" }, primaryCategoryIdAction(state))
        .with({ type: "venue" }, venueAction(state))
        .with({ type: "organizer" }, organizerAction(state))
        .with({ type: "start-date" }, startDateAction(state))
        .with({ type: "start-time" }, startTimeAction(state))
        .with({ type: "end-date" }, endDateAction(state))
        .with({ type: "end-time" }, endTimeAction(state))
        .with({ type: "repeat" }, repeatAction(state))
        .with({ type: "weekdays" }, weekdaysAction(state))
        .with({ type: "monthly-mode" }, monthlyModeAction(state))
        .with({ type: "until" }, untilAction(state))
        .with({ type: "added-dates" }, addedDatesAction(state))
        .with({ type: "removed-dates" }, removedDatesAction(state))
        .with({ type: "photos" }, photosAction(state))
        .with({ type: "price" }, priceAction(state))
        .with({ type: "instagram-url" }, instagramUrlAction(state))
        .with({ type: "facebook-url" }, facebookUrlAction(state))
        .exhaustive()

//#endregion

//#region Conversions

/**
 * @description Returns the local date-time of a date and a time, absent when either is
 * @param date Calendar day
 * @param time Wall-clock time
 */
export const localDateTimeOf = (
    date: Date | undefined,
    time: Time | undefined,
): string | undefined =>
    date === undefined || time === undefined
        ? undefined
        : `${isoDate(date)}T${isoTime({ ...time, seconds: 0, milliseconds: 0 })}`

/**
 * @description Builds the recurrence of the form, `null` for a single event
 * @param state Event form state
 */
const recurrenceOf = (state: EventFormState) =>
    match(state.repeat ?? "single")
        .with("single", () => null)
        .with("weekly", () => ({
            rule: {
                frequency: "weekly" as const,
                weekdays: state.weekdays ?? [],
                until: state.until === undefined ? undefined : isoDate(state.until),
            },
            addedDates: state.addedDates ?? [],
            removedDates: state.removedDates ?? [],
        }))
        .with("monthly", () => ({
            rule: {
                frequency: "monthly" as const,
                mode: state.monthlyMode ?? "day-of-month",
                until: state.until === undefined ? undefined : isoDate(state.until),
            },
            addedDates: state.addedDates ?? [],
            removedDates: state.removedDates ?? [],
        }))
        .exhaustive()

/**
 * @description Maps the event form to the event write
 * @param state Event form state
 * @param i18n Instance translating the field errors
 * @param context Whether the session is an Admin, who picks the organizer
 */
export const eventFormStateToUpsert = (
    state: EventFormState,
    i18n: I18nInstance,
    context: { isAdmin: boolean },
): FormResult<EventFormState, EventUpsert> => {
    const parsed = parseFormState(
        eventUpsertSchema,
        {
            title: state.title,
            description: state.description ?? null,
            categoryIds: state.categoryIds,
            primaryCategoryId: state.primaryCategoryId,
            venueId: state.venue?.id,
            startsAt: localDateTimeOf(state.startDate, state.startTime),
            endsAt: localDateTimeOf(state.endDate, state.endTime),
            recurrence: recurrenceOf(state),
            photoKeys: state.photos?.map(photo => photo.key),
            externalLinks: {
                instagramUrl: state.instagramUrl ?? null,
                facebookUrl: state.facebookUrl ?? null,
            },
            price: state.price ?? null,
            organizerId: context.isAdmin ? state.organizer?.id : undefined,
        } satisfies Specified<Partial<EventUpsert>, { exclude: "recurrence" }>,
        i18n,
    )
    const required = i18n.getFixedT(null, "ui")("FormErrors.Required")
    const organizerMissing = context.isAdmin && state.organizer === undefined

    const tree = parsed.success
        ? undefined
        : (z.treeifyError(parsed.error).properties ?? {})
    const recurrenceTree = tree?.recurrence
    const ruleTree =
        recurrenceTree !== undefined && "properties" in recurrenceTree
            ? recurrenceTree.properties?.rule
            : undefined
    const errors = {
        title: tree?.title,
        description: tree?.description,
        categoryIds: tree?.categoryIds,
        primaryCategoryId: tree?.primaryCategoryId,
        venue: tree?.venueId,
        organizer: organizerMissing ? { errors: [required] } : tree?.organizerId,
        startDate: tree?.startsAt,
        startTime: undefined,
        endDate: tree?.endsAt,
        endTime: undefined,
        repeat: undefined,
        weekdays:
            ruleTree?.properties !== undefined && "weekdays" in ruleTree.properties
                ? ruleTree.properties.weekdays
                : undefined,
        monthlyMode: undefined,
        until: ruleTree?.properties?.until,
        addedDates:
            recurrenceTree === undefined ? undefined : { errors: recurrenceTree.errors },
        removedDates: undefined,
        photos: tree?.photoKeys,
        price: tree?.price,
        instagramUrl: tree?.externalLinks?.properties?.instagramUrl,
        facebookUrl: tree?.externalLinks?.properties?.facebookUrl,
    } satisfies Specified<FormErrors<EventFormState>, { mode: "shallow" }>

    return parsed.success && !organizerMissing ? ok(parsed.data) : err(errors)
}

//#endregion
