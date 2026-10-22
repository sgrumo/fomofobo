"use client"

import type { FormErrors } from "frontend-shared/types"
import { MAX_ENDED_VISIBLE_DAYS, MAX_PARTICIPANT_THRESHOLD } from "models"
import { useTranslation } from "react-i18next"
import { Field } from "ui-components/field"
import { NumberInput } from "ui-components/number-input"

import type { SettingsFormAction, SettingsFormState } from "./settings-form.state"
import { settingsFormReducer } from "./settings-form.state"

interface SettingsFormProps {
    value: SettingsFormState
    onValueChange: (value: SettingsFormState) => void
    errors: FormErrors<SettingsFormState> | undefined
    disabled?: boolean
}

export const SettingsForm = (props: SettingsFormProps) => {
    const { t } = useTranslation("shared")

    const onAction = (action: SettingsFormAction) => {
        props.onValueChange(settingsFormReducer(props.value, action))
    }

    return (
        <>
            <Field
                label={t("Backoffice.SettingsForm.EndedVisibleDays")}
                description={t("Backoffice.SettingsForm.EndedVisibleDaysHint", {
                    max: MAX_ENDED_VISIBLE_DAYS,
                })}
                required={true}
                errors={props.errors?.endedVisibleDays?.errors}
            >
                <NumberInput
                    size="md"
                    min={0}
                    max={MAX_ENDED_VISIBLE_DAYS}
                    value={props.value.endedVisibleDays}
                    onValueChange={days => {
                        onAction({ type: "ended-visible-days", value: days })
                    }}
                    disabled={props.disabled}
                />
            </Field>
            <Field
                label={t("Backoffice.SettingsForm.ParticipantThreshold")}
                description={t("Backoffice.SettingsForm.ParticipantThresholdHint", {
                    max: MAX_PARTICIPANT_THRESHOLD,
                })}
                required={true}
                errors={props.errors?.participantThreshold?.errors}
            >
                <NumberInput
                    size="md"
                    min={1}
                    max={MAX_PARTICIPANT_THRESHOLD}
                    value={props.value.participantThreshold}
                    onValueChange={threshold => {
                        onAction({ type: "participant-threshold", value: threshold })
                    }}
                    disabled={props.disabled}
                />
            </Field>
        </>
    )
}
