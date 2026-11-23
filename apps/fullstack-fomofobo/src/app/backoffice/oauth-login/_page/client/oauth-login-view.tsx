"use client"

import { useMutation } from "@tanstack/react-query"
import type { AccountCredentials } from "models"
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
import type { RouteClientComponentProps } from "@/framework/routes/routes"
import { signInForOauth } from "@/lib/auth/oauth"

/**
 * @description Signs in with the signed authorization query of the page URL
 * @param credentials Email and password typed in the login form
 */
const signInFromPage = async (credentials: AccountCredentials) =>
    await signInForOauth(credentials, globalThis.location.search.slice(1))

export const OauthLoginView = (
    _props: RouteClientComponentProps<"backofficeOauthLogin">,
) => {
    const { t, i18n } = useTranslation("shared")
    const toast = useToast()
    const { formId, form, setForm, errors, convert } = useForm(
        initialLoginFormState,
        loginFormStateToCredentials,
        i18n,
    )

    const signIn = useMutation({
        mutationFn: signInFromPage,
        onSuccess: outcome => {
            if (outcome.kind === "redirect") {
                globalThis.location.assign(outcome.url)
            }
        },
    })
    const outcome = signIn.data?.kind
    const busy = signIn.isPending || outcome === "redirect"

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
                <h1 className="tp-pixel-xl">{t("Backoffice.OauthLogin.Title")}</h1>
                <p>{t("Backoffice.OauthLogin.Hint")}</p>
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
                        disabled={busy}
                    />
                </Form>
                <Button
                    variant="primary"
                    size="md"
                    type="submit"
                    form={formId}
                    loading={busy}
                >
                    {t("Backoffice.Login.Submit")}
                </Button>
            </div>
        </main>
    )
}
