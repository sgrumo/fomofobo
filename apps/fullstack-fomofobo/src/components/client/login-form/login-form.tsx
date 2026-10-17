"use client"

import type { FormErrors } from "frontend-shared/types"
import { useTranslation } from "react-i18next"
import { Field } from "ui-components/field"
import { PasswordInput } from "ui-components/password-input"
import { StringInput } from "ui-components/string-input"

import type { LoginFormAction, LoginFormState } from "./login-form.state"
import { loginFormReducer } from "./login-form.state"

interface LoginFormProps {
    value: LoginFormState
    onValueChange: (value: LoginFormState) => void
    errors: FormErrors<LoginFormState> | undefined
    disabled?: boolean
}

export const LoginForm = (props: LoginFormProps) => {
    const { t } = useTranslation("shared")

    const onAction = (action: LoginFormAction) => {
        props.onValueChange(loginFormReducer(props.value, action))
    }

    return (
        <>
            <Field
                label={t("Backoffice.Login.Email")}
                required={true}
                errors={props.errors?.email?.errors}
            >
                <StringInput
                    type="email"
                    autoComplete="username"
                    value={props.value.email}
                    onValueChange={value => {
                        onAction({ type: "email", value })
                    }}
                    disabled={props.disabled}
                />
            </Field>
            <Field
                label={t("Backoffice.Login.Password")}
                required={true}
                errors={props.errors?.password?.errors}
            >
                <PasswordInput
                    autoComplete="current-password"
                    value={props.value.password}
                    onValueChange={value => {
                        onAction({ type: "password", value })
                    }}
                    disabled={props.disabled}
                />
            </Field>
        </>
    )
}
