import type { Action, FormResult } from "frontend-shared/types"
import type { i18n as I18nInstance } from "i18next"
import type { Category, CategoryCreation, CategoryIcon } from "models"
import { categoryCreationSchema } from "models"
import { err, ok } from "shared/result"
import type { Partial, Specified } from "shared/types"
import { match } from "ts-pattern"
import { z } from "zod"

import { parseFormState } from "@/lib/forms/forms"

//#region Types

export interface CategoryFormState {
    name: string | undefined
    icon: CategoryIcon | undefined
}

export type CategoryFormAction =
    | { type: "name"; value: string | undefined }
    | { type: "icon"; value: CategoryIcon | undefined }

//#endregion

//#region Initial State

export const initialCategoryFormState = (): CategoryFormState => ({
    name: undefined,
    icon: undefined,
})

/**
 * @description Builds the form state of a stored category
 * @param category Category edited
 */
export const categoryFormStateFromCategory = (category: Category): CategoryFormState => ({
    name: category.name,
    icon: category.icon,
})

//#endregion

//#region Actions

const nameAction =
    (state: CategoryFormState) => (action: Action<CategoryFormAction, "name">) => ({
        ...state,
        name: action.value,
    })

const iconAction =
    (state: CategoryFormState) => (action: Action<CategoryFormAction, "icon">) => ({
        ...state,
        icon: action.value,
    })

//#endregion

//#region Reducer

export const categoryFormReducer = (
    state: CategoryFormState,
    action: CategoryFormAction,
): CategoryFormState =>
    match(action)
        .with({ type: "name" }, nameAction(state))
        .with({ type: "icon" }, iconAction(state))
        .exhaustive()

//#endregion

//#region Conversions

/**
 * @description Maps the category form to the fields of a category
 * @param state Category form state
 * @param i18n Instance translating the field errors
 */
export const categoryFormStateToCreation = (
    state: CategoryFormState,
    i18n: I18nInstance,
): FormResult<CategoryFormState, CategoryCreation> => {
    const parsed = parseFormState(
        categoryCreationSchema,
        { name: state.name, icon: state.icon } satisfies Specified<
            Partial<CategoryCreation>
        >,
        i18n,
    )
    return parsed.success
        ? ok(parsed.data)
        : err(z.treeifyError(parsed.error).properties ?? {})
}

//#endregion
