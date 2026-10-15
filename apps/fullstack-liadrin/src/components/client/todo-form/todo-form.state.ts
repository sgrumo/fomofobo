"use client"

import type { Action, FormResult } from "frontend-shared/types"
import type { i18n as I18nInstance } from "i18next"
import type { Todo, TodoCreation, TodoUpdate } from "models"
import { todoCreationSchema, todoUpdateSchema } from "models"
import { err, ok } from "shared/result"
import { dateFromIso, isoDate } from "shared/temporal"
import type { Partial, Specified } from "shared/types"
import { isDefined } from "shared/values"
import { match } from "ts-pattern"
import { z } from "zod"

import { parseFormState } from "@/lib/forms/forms"

//#region Types
export interface TodoFormState {
    title: string | undefined
    description: string | undefined
    completed: boolean | undefined
    endDate: Date | undefined
}

export type TodoFormAction =
    | { type: "title"; value: string | undefined }
    | { type: "description"; value: string | undefined }
    | { type: "completed"; value: boolean | undefined }
    | { type: "end-date"; value: Date | undefined }
//#endregion

//#region Initial State
export const initialTodoFormState = (): TodoFormState => ({
    title: undefined,
    description: undefined,
    completed: undefined,
    endDate: undefined,
})

/**
 * @description Builds the form state prefilled from an existing todo
 * @param todo Entity read
 */
export const todoFormStateFromTodo = (todo: Todo): TodoFormState => ({
    title: todo.title,
    description: todo.description ?? undefined,
    completed: todo.completed,
    endDate: todo.endDate === null ? undefined : dateFromIso(todo.endDate),
})
//#endregion

//#region Actions
const titleAction =
    (state: TodoFormState) =>
    (action: Action<TodoFormAction, "title">): TodoFormState => ({
        ...state,
        title: action.value,
    })

const descriptionAction =
    (state: TodoFormState) =>
    (action: Action<TodoFormAction, "description">): TodoFormState => ({
        ...state,
        description: action.value,
    })

const completedAction =
    (state: TodoFormState) =>
    (action: Action<TodoFormAction, "completed">): TodoFormState => ({
        ...state,
        completed: action.value,
    })

const endDateAction =
    (state: TodoFormState) =>
    (action: Action<TodoFormAction, "end-date">): TodoFormState => ({
        ...state,
        endDate: action.value,
    })
//#endregion

//#region Reducer
/**
 * @description Returns the next form state for an action
 * @param state Current state
 * @param action Action applied
 */
export const todoFormReducer = (
    state: TodoFormState,
    action: TodoFormAction,
): TodoFormState =>
    match(action)
        .with({ type: "title" }, titleAction(state))
        .with({ type: "description" }, descriptionAction(state))
        .with({ type: "completed" }, completedAction(state))
        .with({ type: "end-date" }, endDateAction(state))
        .exhaustive()
//#endregion

//#region Conversions
/**
 * @description Validates the form state and maps it to the creation payload
 * @param state State converted
 * @param i18n Instance the error messages are resolved with
 */
export const todoFormStateToCreation = (
    state: TodoFormState,
    i18n: I18nInstance,
): FormResult<TodoFormState, TodoCreation> => {
    const parsed = parseFormState(
        todoCreationSchema,
        {
            title: state.title,
            description: state.description,
            endDate: isDefined(state.endDate) ? isoDate(state.endDate) : undefined,
        } satisfies Specified<Partial<TodoCreation>>,
        i18n,
    )
    return parsed.success
        ? ok(parsed.data)
        : err(z.treeifyError(parsed.error).properties ?? {})
}

/**
 * @description Validates the form state and maps it to the update payload
 * @param state State converted
 * @param i18n Instance the error messages are resolved with
 * @remarks Maps an empty description or end date to `null`, so the update clears the column
 */
export const todoFormStateToUpdate = (
    state: TodoFormState,
    i18n: I18nInstance,
): FormResult<TodoFormState, TodoUpdate> => {
    const parsed = parseFormState(
        todoUpdateSchema,
        {
            title: state.title,
            description: state.description ?? null,
            completed: state.completed,
            endDate: isDefined(state.endDate) ? isoDate(state.endDate) : null,
        } satisfies Specified<Partial<TodoUpdate>>,
        i18n,
    )
    return parsed.success
        ? ok(parsed.data)
        : err(z.treeifyError(parsed.error).properties ?? {})
}
//#endregion
