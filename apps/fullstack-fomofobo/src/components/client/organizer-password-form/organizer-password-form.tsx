"use client"

import type { FormErrors } from "frontend-shared/types"
import { useTranslation } from "react-i18next"
import { Field } from "ui-components/field"
import { PasswordInput } from "ui-components/password-input"

import type {
    OrganizerPasswordFormAction,
    OrganizerPasswordFormState,
} from "./organizer-password-form.state"
import { organizerPasswordFormReducer } from "./organizer-password-form.state"

interface OrganizerPasswordFormProps {
    value: OrganizerPasswordFormState
    onValueChange: (value: OrganizerPasswordFormState) => void
    errors: FormErrors<OrganizerPasswordFormState> | undefined
    disabled?: boolean
}

export const OrganizerPasswordForm = (props: OrganizerPasswordFormProps) => {
    const { t } = useTranslation("shared")

    const onAction = (action: OrganizerPasswordFormAction) => {
        props.onValueChange(organizerPasswordFormReducer(props.value, action))
    }

    return (
        <Field
            label={t("Backoffice.OrganizerForm.NewPassword")}
            description={t("Backoffice.OrganizerForm.PasswordHint")}
            required={true}
            errors={props.errors?.password?.errors}
        >
            <PasswordInput
                autoComplete="new-password"
                value={props.value.password}
                onValueChange={password => {
                    onAction({ type: "password", value: password })
                }}
                disabled={props.disabled}
            />
        </Field>
    )
}
