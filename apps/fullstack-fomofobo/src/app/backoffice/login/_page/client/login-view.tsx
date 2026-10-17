"use client"

import { useMutation } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { useForm } from "react-shared"
import { Alert } from "ui-components/alert"
import { Button } from "ui-components/button"
import { Form } from "ui-components/form"
import { useToast } from "ui-components/toast"

import { LoginForm } from "@/components/client/login-form/login-form"
import {
    initialLoginFormState,
    loginFormStateToCredentials,
} from "@/components/client/login-form/login-form.state"
import { useDynamicRoute } from "@/framework/routes/route-hooks/use-dynamic-route"
import { routes } from "@/framework/routes/routes"
import type { RouteClientComponentProps } from "@/framework/routes/routes"
import { sanitizeReturnPath } from "@/lib/auth/return-path"
import { signInWithEmail } from "@/lib/auth/sign-in"

export const LoginView = (props: RouteClientComponentProps<"backofficeLogin">) => {
    const { t, i18n } = useTranslation("shared")
    const toast = useToast()
    const { query } = useDynamicRoute(routes[props.route])
    const { formId, form, setForm, errors, convert } = useForm(
        initialLoginFormState,
        loginFormStateToCredentials,
        i18n,
    )

    const signIn = useMutation({
        mutationFn: signInWithEmail,
        onSuccess: outcome => {
            if (outcome === "signed-in") {
                // A document load, so the backoffice layout reads the new session.
                globalThis.location.assign(sanitizeReturnPath(query.returnTo))
            }
        },
    })
    const outcome = signIn.data

    const handleSubmit = () => {
        const result = convert(form)
        if (!result.success) {
            toast.add("form-validation-error")
            return
        }
        signIn.mutate(result.value)
    }

    return (
        <main className="bg-surface text-fg flex min-h-dvh items-center justify-center p-4">
            <div className="border-line shadow-hard-md flex w-full max-w-sm flex-col gap-4 border-2 p-6">
                <h1 className="tp-pixel-xl">{t("Backoffice.Login.Title")}</h1>
                {outcome === undefined && query.reason === "blocked" && (
                    <Alert type="error" text={t("Backoffice.Login.Blocked")} />
                )}
                {outcome === "invalid-credentials" && (
                    <Alert type="error" text={t("Backoffice.Login.InvalidCredentials")} />
                )}
                {outcome === "failed" && (
                    <Alert type="error" text={t("Backoffice.Login.Failed")} />
                )}
                <Form
                    id={formId}
                    mode="edit"
                    noValidate={true}
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-4"
                >
                    <LoginForm
                        value={form}
                        onValueChange={setForm}
                        errors={errors}
                        disabled={signIn.isPending || outcome === "signed-in"}
                    />
                </Form>
                <Button
                    variant="primary"
                    size="md"
                    type="submit"
                    form={formId}
                    loading={signIn.isPending || outcome === "signed-in"}
                >
                    {t("Backoffice.Login.Submit")}
                </Button>
            </div>
        </main>
    )
}
