import type { Action, FormResult } from "frontend-shared/types"
import type { i18n as I18nInstance } from "i18next"
import type { PlatformSettings, PlatformSettingsUpdate } from "models"
import { platformSettingsUpdateSchema } from "models"
import { err, ok } from "shared/result"
import type { Partial, Specified } from "shared/types"
import { match } from "ts-pattern"
import { z } from "zod"

import { parseFormState } from "@/lib/forms/forms"

//#region Types

export interface SettingsFormState {
    endedVisibleDays: number | undefined
    participantThreshold: number | undefined
}

export type SettingsFormAction =
    | { type: "ended-visible-days"; value: number | undefined }
    | { type: "participant-threshold"; value: number | undefined }

//#endregion

//#region Initial State

/**
 * @description Builds the form state of the stored platform settings
 * @param settings Settings edited
 */
export const settingsFormStateFromSettings = (
    settings: PlatformSettings,
): SettingsFormState => ({
    endedVisibleDays: settings.endedVisibleDays,
    participantThreshold: settings.participantThreshold,
})

//#endregion

//#region Actions

const endedVisibleDaysAction =
    (state: SettingsFormState) =>
    (action: Action<SettingsFormAction, "ended-visible-days">) => ({
        ...state,
        endedVisibleDays: action.value,
    })

const participantThresholdAction =
    (state: SettingsFormState) =>
    (action: Action<SettingsFormAction, "participant-threshold">) => ({
        ...state,
        participantThreshold: action.value,
    })

//#endregion

//#region Reducer

export const settingsFormReducer = (
    state: SettingsFormState,
    action: SettingsFormAction,
): SettingsFormState =>
    match(action)
        .with({ type: "ended-visible-days" }, endedVisibleDaysAction(state))
        .with({ type: "participant-threshold" }, participantThresholdAction(state))
        .exhaustive()

//#endregion

//#region Conversions

/**
 * @description Maps the settings form to the platform settings saved
 * @param state Settings form state
 * @param i18n Instance translating the field errors
 */
export const settingsFormStateToUpdate = (
    state: SettingsFormState,
    i18n: I18nInstance,
): FormResult<SettingsFormState, PlatformSettingsUpdate> => {
    const parsed = parseFormState(
        platformSettingsUpdateSchema,
        {
            endedVisibleDays: state.endedVisibleDays,
            participantThreshold: state.participantThreshold,
        } satisfies Specified<Partial<PlatformSettingsUpdate>>,
        i18n,
    )
    return parsed.success
        ? ok(parsed.data)
        : err(z.treeifyError(parsed.error).properties ?? {})
}

//#endregion
