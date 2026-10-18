import type { Action, FormResult } from "frontend-shared/types"
import type { i18n as I18nInstance } from "i18next"
import type { OrganizerCreation } from "models"
import { organizerCreationSchema } from "models"
import { err, ok } from "shared/result"
import type { Partial, Specified } from "shared/types"
import { match } from "ts-pattern"
import { z } from "zod"

import { parseFormState } from "@/lib/forms/forms"

//#region Types

export interface OrganizerFormState {
    name: string | undefined
    email: string | undefined
    password: string | undefined
}

export type OrganizerFormAction =
    | { type: "name"; value: string | undefined }
    | { type: "email"; value: string | undefined }
    | { type: "password"; value: string | undefined }

//#endregion

//#region Initial State

export const initialOrganizerFormState = (): OrganizerFormState => ({
    name: undefined,
    email: undefined,
    password: undefined,
})

//#endregion

//#region Actions

const nameAction =
    (state: OrganizerFormState) => (action: Action<OrganizerFormAction, "name">) => ({
        ...state,
        name: action.value,
    })

const emailAction =
    (state: OrganizerFormState) => (action: Action<OrganizerFormAction, "email">) => ({
        ...state,
        email: action.value,
    })

const passwordAction =
    (state: OrganizerFormState) => (action: Action<OrganizerFormAction, "password">) => ({
        ...state,
        password: action.value,
    })

//#endregion

//#region Reducer

export const organizerFormReducer = (
    state: OrganizerFormState,
    action: OrganizerFormAction,
): OrganizerFormState =>
    match(action)
        .with({ type: "name" }, nameAction(state))
        .with({ type: "email" }, emailAction(state))
        .with({ type: "password" }, passwordAction(state))
        .exhaustive()

//#endregion

//#region Conversions

/**
 * @description Maps the organizer form to the creation of an Organizer account
 * @param state Organizer form state
 * @param i18n Instance translating the field errors
 */
export const organizerFormStateToCreation = (
    state: OrganizerFormState,
    i18n: I18nInstance,
): FormResult<OrganizerFormState, OrganizerCreation> => {
    const parsed = parseFormState(
        organizerCreationSchema,
        {
            name: state.name,
            email: state.email?.trim(),
            password: state.password,
        } satisfies Specified<Partial<OrganizerCreation>>,
        i18n,
    )
    return parsed.success
        ? ok(parsed.data)
        : err(z.treeifyError(parsed.error).properties ?? {})
}

//#endregion
