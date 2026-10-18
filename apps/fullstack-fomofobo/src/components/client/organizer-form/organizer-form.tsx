"use client"

import type { FormErrors } from "frontend-shared/types"
import { useTranslation } from "react-i18next"
import { Field } from "ui-components/field"
import { PasswordInput } from "ui-components/password-input"
import { StringInput } from "ui-components/string-input"

import type { OrganizerFormAction, OrganizerFormState } from "./organizer-form.state"
import { organizerFormReducer } from "./organizer-form.state"

interface OrganizerFormProps {
    value: OrganizerFormState
    onValueChange: (value: OrganizerFormState) => void
    errors: FormErrors<OrganizerFormState> | undefined
    disabled?: boolean
}

export const OrganizerForm = (props: OrganizerFormProps) => {
    const { t } = useTranslation("shared")

    const onAction = (action: OrganizerFormAction) => {
        props.onValueChange(organizerFormReducer(props.value, action))
    }

    return (
        <>
            <Field
                label={t("Backoffice.OrganizerForm.Name")}
                required={true}
                errors={props.errors?.name?.errors}
            >
                <StringInput
                    value={props.value.name}
                    onValueChange={name => {
                        onAction({ type: "name", value: name })
                    }}
                    disabled={props.disabled}
                />
            </Field>
            <Field
                label={t("Backoffice.OrganizerForm.Email")}
                required={true}
                errors={props.errors?.email?.errors}
            >
                <StringInput
                    type="email"
                    autoComplete="off"
                    value={props.value.email}
                    onValueChange={email => {
                        onAction({ type: "email", value: email })
                    }}
                    disabled={props.disabled}
                />
            </Field>
            {/* PLACEHOLDER(OP-25): the Admin hands the temporary password over */}
            <Field
                label={t("Backoffice.OrganizerForm.Password")}
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
        </>
    )
}
