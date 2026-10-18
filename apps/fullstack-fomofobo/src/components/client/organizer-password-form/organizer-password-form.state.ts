import type { Action, FormResult } from "frontend-shared/types"
import type { i18n as I18nInstance } from "i18next"
import type { OrganizerPassword } from "models"
import { organizerPasswordSchema } from "models"
import { err, ok } from "shared/result"
import type { Partial, Specified } from "shared/types"
import { match } from "ts-pattern"
import { z } from "zod"

import { parseFormState } from "@/lib/forms/forms"

//#region Types

export interface OrganizerPasswordFormState {
    password: string | undefined
}

export interface OrganizerPasswordFormAction {
    type: "password"
    value: string | undefined
}

//#endregion

//#region Initial State

export const initialOrganizerPasswordFormState = (): OrganizerPasswordFormState => ({
    password: undefined,
})

//#endregion

//#region Actions

const passwordAction =
    (state: OrganizerPasswordFormState) =>
    (action: Action<OrganizerPasswordFormAction, "password">) => ({
        ...state,
        password: action.value,
    })

//#endregion

//#region Reducer

export const organizerPasswordFormReducer = (
    state: OrganizerPasswordFormState,
    action: OrganizerPasswordFormAction,
): OrganizerPasswordFormState =>
    match(action).with({ type: "password" }, passwordAction(state)).exhaustive()

//#endregion

//#region Conversions

/**
 * @description Maps the password form to the new password of an Organizer
 * @param state Password form state
 * @param i18n Instance translating the field errors
 */
export const organizerPasswordFormStateToPassword = (
    state: OrganizerPasswordFormState,
    i18n: I18nInstance,
): FormResult<OrganizerPasswordFormState, OrganizerPassword> => {
    const parsed = parseFormState(
        organizerPasswordSchema,
        { password: state.password } satisfies Specified<Partial<OrganizerPassword>>,
        i18n,
    )
    return parsed.success
        ? ok(parsed.data)
        : err(z.treeifyError(parsed.error).properties ?? {})
}

//#endregion
