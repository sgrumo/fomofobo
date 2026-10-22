"use client"

import { useMutation, useQuery } from "@tanstack/react-query"
import type { PlatformSettings } from "models"
import { useTranslation } from "react-i18next"
import { useForm } from "react-shared"
import { match, P } from "ts-pattern"
import { Alert } from "ui-components/alert"
import { Button } from "ui-components/button"
import { Form } from "ui-components/form"
import { Spinner } from "ui-components/spinner"
import { useToast } from "ui-components/toast"

import { SettingsForm } from "@/components/client/settings-form/settings-form"
import {
    settingsFormStateFromSettings,
    settingsFormStateToUpdate,
} from "@/components/client/settings-form/settings-form.state"
import type { RouteClientComponentProps } from "@/framework/routes/routes"
import { api } from "@/lib/api/client-api"
import { dateTimeOf } from "@/lib/events/local-format"
import { useMutationFeedback } from "@/lib/hooks/use-mutation-feedback"
import { PLATFORM_TIME_ZONE } from "@/lib/platform/platform"

export const BackofficeSettingsView = (
    _props: RouteClientComponentProps<"backofficeSettings">,
) => {
    const { t } = useTranslation("shared")
    const {
        data: settings,
        isPending,
        isError,
    } = useQuery(api.getSettingsQuery({ params: {}, query: {} }))

    return (
        <section className="flex max-w-xl flex-col gap-4">
            <h1 className="tp-pixel-xl">{t("Backoffice.Settings.Title")}</h1>
            {isPending && <Spinner title={t("Backoffice.List.Loading")} />}
            {isError && <Alert type="error" text={t("Backoffice.List.Error")} />}
            {settings !== undefined && <SettingsEditor settings={settings} />}
        </section>
    )
}

interface SettingsEditorProps {
    settings: PlatformSettings
}

const SettingsEditor = (props: SettingsEditorProps) => {
    const { t, i18n } = useTranslation("shared")
    const toast = useToast()
    const feedback = useMutationFeedback()
    const { formId, form, setForm, errors, convert } = useForm(
        () => settingsFormStateFromSettings(props.settings),
        settingsFormStateToUpdate,
        i18n,
    )
    const { mutate, isPending } = useMutation(api.updateSettingsMutation)

    const handleSubmit = () => {
        const result = convert(form)
        if (!result.success) {
            toast.add("form-validation-error")
            return
        }
        mutate(result.value, {
            onSuccess: () => {
                feedback.succeeded(t("Backoffice.Settings.Toast.Saved"))
            },
            onError: feedback.failed,
        })
    }

    const lastChange = match([props.settings.updatedAt, props.settings.updatedBy])
        .with([null, P._], () => t("Backoffice.Settings.Defaults"))
        .with([P.string, null], ([updatedAt]) =>
            t("Backoffice.Settings.LastChangeNoAuthor", {
                date: dateTimeOf(new Date(updatedAt), PLATFORM_TIME_ZONE),
            }),
        )
        .with([P.string, P.nonNullable], ([updatedAt, updatedBy]) =>
            t("Backoffice.Settings.LastChange", {
                name: updatedBy.name,
                date: dateTimeOf(new Date(updatedAt), PLATFORM_TIME_ZONE),
            }),
        )
        .exhaustive()

    return (
        <>
            <Form
                id={formId}
                mode="edit"
                noValidate={true}
                onSubmit={handleSubmit}
                className="flex flex-col gap-4"
            >
                <SettingsForm
                    value={form}
                    onValueChange={setForm}
                    errors={errors}
                    disabled={isPending}
                />
            </Form>
            <p className="tp-body-sm">{lastChange}</p>
            <Button
                variant="primary"
                size="md"
                type="submit"
                form={formId}
                loading={isPending}
                className="self-start"
            >
                {t("Backoffice.Settings.Save")}
            </Button>
        </>
    )
}
