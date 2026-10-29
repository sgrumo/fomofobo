import type { Action, FormResult } from "frontend-shared/types"
import type { i18n as I18nInstance } from "i18next"
import type { PermanentVenueKindChange, Venue, VenueKind, VenueKindChange } from "models"
import { permanentVenueKindChangeSchema } from "models"
import { err, ok } from "shared/result"
import type { WeekDay } from "shared/temporal"
import type { Partial, Specified } from "shared/types"
import { match } from "ts-pattern"
import { z } from "zod"

import { parseFormState } from "@/lib/forms/forms"

//#region Types

export interface VenueKindFormState {
    kind: VenueKind | undefined
    programmeUrl: string | undefined
    categoryId: string | undefined
    closingDays: WeekDay[]
    alwaysOpen: boolean
}

export type VenueKindFormAction =
    | { type: "kind"; value: VenueKind | undefined }
    | { type: "programme-url"; value: string | undefined }
    | { type: "category-id"; value: string | undefined }
    | { type: "closing-day"; value: { day: WeekDay; closed: boolean } }
    | { type: "always-open"; value: boolean }

//#endregion

//#region Initial State

/**
 * @description Builds the form state of the kind of a stored venue
 * @param venue Venue edited
 */
export const venueKindFormStateFromVenue = (venue: Venue): VenueKindFormState => ({
    kind: venue.kind,
    programmeUrl: venue.programmeUrl ?? undefined,
    categoryId: venue.categoryId ?? undefined,
    closingDays: venue.closingDays ?? [],
    alwaysOpen: venue.closingDays?.length === 0,
})

//#endregion

//#region Actions

const kindAction =
    (state: VenueKindFormState) => (action: Action<VenueKindFormAction, "kind">) => ({
        ...state,
        kind: action.value,
    })

const programmeUrlAction =
    (state: VenueKindFormState) =>
    (action: Action<VenueKindFormAction, "programme-url">) => ({
        ...state,
        programmeUrl: action.value,
    })

const categoryIdAction =
    (state: VenueKindFormState) =>
    (action: Action<VenueKindFormAction, "category-id">) => ({
        ...state,
        categoryId: action.value,
    })

// A closing day and "always open" exclude each other
const closingDayAction =
    (state: VenueKindFormState) =>
    (action: Action<VenueKindFormAction, "closing-day">) => {
        const others = state.closingDays.filter(day => day !== action.value.day)
        return {
            ...state,
            closingDays: action.value.closed ? [...others, action.value.day] : others,
            alwaysOpen: state.alwaysOpen && !action.value.closed,
        }
    }

const alwaysOpenAction =
    (state: VenueKindFormState) =>
    (action: Action<VenueKindFormAction, "always-open">) => ({
        ...state,
        closingDays: action.value ? [] : state.closingDays,
        alwaysOpen: action.value,
    })

//#endregion

//#region Reducer

export const venueKindFormReducer = (
    state: VenueKindFormState,
    action: VenueKindFormAction,
): VenueKindFormState =>
    match(action)
        .with({ type: "kind" }, kindAction(state))
        .with({ type: "programme-url" }, programmeUrlAction(state))
        .with({ type: "category-id" }, categoryIdAction(state))
        .with({ type: "closing-day" }, closingDayAction(state))
        .with({ type: "always-open" }, alwaysOpenAction(state))
        .exhaustive()

//#endregion

//#region Conversions

/**
 * @description Maps the kind form to a kind change: the regular kind alone, or a permanent kind with its programme link, category and closing days
 * @param state Venue kind form state
 * @param i18n Instance translating the field errors
 */
export const venueKindFormStateToChange = (
    state: VenueKindFormState,
    i18n: I18nInstance,
): FormResult<VenueKindFormState, VenueKindChange> => {
    if (state.kind === "regular") {
        return ok({ kind: "regular" })
    }
    const parsed = parseFormState(
        permanentVenueKindChangeSchema,
        {
            kind: state.kind,
            programmeUrl: state.programmeUrl,
            categoryId: state.categoryId,
            // No day and no "always open" leaves the field unanswered
            closingDays:
                state.alwaysOpen || state.closingDays.length > 0
                    ? state.closingDays
                    : undefined,
        } satisfies Specified<Partial<PermanentVenueKindChange>>,
        i18n,
    )
    return parsed.success
        ? ok(parsed.data)
        : err(z.treeifyError(parsed.error).properties ?? {})
}

//#endregion
