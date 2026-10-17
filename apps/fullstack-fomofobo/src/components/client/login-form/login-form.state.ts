import type { Action, FormResult } from "frontend-shared/types"
import type { i18n as I18nInstance } from "i18next"
import type { AccountCredentials } from "models"
import { accountCredentialsSchema } from "models"
import { err, ok } from "shared/result"
import type { Partial, Specified } from "shared/types"
import { match } from "ts-pattern"
import { z } from "zod"

import { parseFormState } from "@/lib/forms/forms"

//#region Types

export interface LoginFormState {
    email: string | undefined
    password: string | undefined
}

export type LoginFormAction =
    | { type: "email"; value: string | undefined }
    | { type: "password"; value: string | undefined }

//#endregion

//#region Initial State

export const initialLoginFormState = (): LoginFormState => ({
    email: undefined,
    password: undefined,
})

//#endregion

//#region Actions

const emailAction =
    (state: LoginFormState) => (action: Action<LoginFormAction, "email">) => ({
        ...state,
        email: action.value,
    })

const passwordAction =
    (state: LoginFormState) => (action: Action<LoginFormAction, "password">) => ({
        ...state,
        password: action.value,
    })

//#endregion

//#region Reducer

export const loginFormReducer = (
    state: LoginFormState,
    action: LoginFormAction,
): LoginFormState =>
    match(action)
        .with({ type: "email" }, emailAction(state))
        .with({ type: "password" }, passwordAction(state))
        .exhaustive()

//#endregion

//#region Conversions

/**
 * @description Maps the login form to the credentials of the sign-in
 * @param state Login form state
 * @param i18n Instance translating the field errors
 */
export const loginFormStateToCredentials = (
    state: LoginFormState,
    i18n: I18nInstance,
): FormResult<LoginFormState, AccountCredentials> => {
    const parsed = parseFormState(
        accountCredentialsSchema,
        {
            email: state.email?.trim(),
            password: state.password,
        } satisfies Specified<Partial<AccountCredentials>>,
        i18n,
    )
    return parsed.success
        ? ok(parsed.data)
        : err(z.treeifyError(parsed.error).properties ?? {})
}

//#endregion
