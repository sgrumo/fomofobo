import type { Action, FormResult } from "frontend-shared/types"
import type { i18n as I18nInstance } from "i18next"
import type { EventBlock } from "models"
import { eventBlockSchema } from "models"
import { err, ok } from "shared/result"
import type { Partial, Specified } from "shared/types"
import { match } from "ts-pattern"
import { z } from "zod"

import { parseFormState } from "@/lib/forms/forms"

//#region Types

export interface BlockEventFormState {
    reason: string | undefined
}

export interface BlockEventFormAction {
    type: "reason"
    value: string | undefined
}

//#endregion

//#region Initial State

export const initialBlockEventFormState = (): BlockEventFormState => ({
    reason: undefined,
})

//#endregion

//#region Actions

const reasonAction =
    (state: BlockEventFormState) => (action: Action<BlockEventFormAction, "reason">) => ({
        ...state,
        reason: action.value,
    })

//#endregion

//#region Reducer

export const blockEventFormReducer = (
    state: BlockEventFormState,
    action: BlockEventFormAction,
): BlockEventFormState =>
    match(action).with({ type: "reason" }, reasonAction(state)).exhaustive()

//#endregion

//#region Conversions

/**
 * @description Maps the block form to the block of an event
 * @param state Block form state
 * @param i18n Instance translating the field errors
 */
export const blockEventFormStateToBlock = (
    state: BlockEventFormState,
    i18n: I18nInstance,
): FormResult<BlockEventFormState, EventBlock> => {
    const parsed = parseFormState(
        eventBlockSchema,
        { reason: state.reason } satisfies Specified<Partial<EventBlock>>,
        i18n,
    )
    return parsed.success
        ? ok(parsed.data)
        : err(z.treeifyError(parsed.error).properties ?? {})
}

//#endregion
