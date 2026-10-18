"use client"

import { useMutation } from "@tanstack/react-query"
import type { Account } from "models"
import type { ReactElement } from "react"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useForm } from "react-shared"
import { Button } from "ui-components/button"
import {
    DialogBody,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogRoot,
    DialogTitle,
    DialogTrigger,
} from "ui-components/dialog"
import { Form } from "ui-components/form"
import { useToast } from "ui-components/toast"

import { OrganizerPasswordForm } from "@/components/client/organizer-password-form/organizer-password-form"
import {
    initialOrganizerPasswordFormState,
    organizerPasswordFormStateToPassword,
} from "@/components/client/organizer-password-form/organizer-password-form.state"
import { api } from "@/lib/api/client-api"
import { useMutationFeedback } from "@/lib/hooks/use-mutation-feedback"

interface SetOrganizerPasswordDialogProps {
    trigger: ReactElement
    organizer: Account
}

export const SetOrganizerPasswordDialog = (props: SetOrganizerPasswordDialogProps) => {
    const { t } = useTranslation("shared")
    const toast = useToast()
    const [open, setOpen] = useState(false)
    const [pending, setPending] = useState(false)

    const onOpenChange = (nextOpen: boolean) => {
        if (!nextOpen && pending) {
            toast.addPlain(
                "warning",
                t("Backoffice.Organizers.Toast.CloseWhileSettingPassword"),
            )
            return
        }
        setOpen(nextOpen)
    }

    return (
        <DialogRoot open={open} onOpenChange={onOpenChange}>
            <DialogTrigger render={props.trigger} />
            <DialogContent className="max-h-[calc(min(26rem,90dvh))] w-[calc(min(30rem,90dvw))]">
                <SetOrganizerPasswordDialogContent
                    organizer={props.organizer}
                    onMutate={() => {
                        setPending(true)
                    }}
                    onSettled={() => {
                        setPending(false)
                    }}
                    onSuccess={() => {
                        setOpen(false)
                    }}
                />
            </DialogContent>
        </DialogRoot>
    )
}

interface SetOrganizerPasswordDialogContentProps {
    organizer: Account
    onMutate: () => void
    onSettled: () => void
    onSuccess: () => void
}

const SetOrganizerPasswordDialogContent = (
    props: SetOrganizerPasswordDialogContentProps,
) => {
    const { t, i18n } = useTranslation("shared")
    const toast = useToast()
    const feedback = useMutationFeedback()
    const { formId, form, setForm, errors, convert } = useForm(
        initialOrganizerPasswordFormState,
        organizerPasswordFormStateToPassword,
        i18n,
    )
    const { mutate, isPending } = useMutation(api.setOrganizerPasswordMutation)

    const handleSubmit = () => {
        const result = convert(form)
        if (!result.success) {
            toast.add("form-validation-error")
            return
        }
        props.onMutate()
        mutate(
            { id: props.organizer.id, body: result.value },
            {
                onSettled: props.onSettled,
                onSuccess: () => {
                    feedback.succeeded(
                        t("Backoffice.Organizers.Toast.PasswordSet", {
                            name: props.organizer.name,
                        }),
                    )
                    props.onSuccess()
                },
                onError: feedback.failed,
            },
        )
    }

    return (
        <>
            <DialogHeader>
                <DialogTitle>{t("Backoffice.Organizers.Password.Title")}</DialogTitle>
            </DialogHeader>
            <DialogBody>
                <DialogDescription>
                    {t("Backoffice.Organizers.Password.Description", {
                        name: props.organizer.name,
                    })}
                </DialogDescription>
                <Form
                    id={formId}
                    mode="edit"
                    noValidate={true}
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-4"
                >
                    <OrganizerPasswordForm
                        value={form}
                        onValueChange={setForm}
                        errors={errors}
                        disabled={isPending}
                    />
                </Form>
            </DialogBody>
            <DialogFooter className="grid grid-cols-2 gap-2">
                <DialogClose
                    render={
                        <Button
                            variant="secondary"
                            size="md"
                            type="button"
                            disabled={isPending}
                        >
                            {t("Backoffice.Actions.Cancel")}
                        </Button>
                    }
                />
                <Button
                    variant="primary"
                    size="md"
                    type="submit"
                    form={formId}
                    loading={isPending}
                >
                    {t("Backoffice.Organizers.Password.Submit")}
                </Button>
            </DialogFooter>
        </>
    )
}
