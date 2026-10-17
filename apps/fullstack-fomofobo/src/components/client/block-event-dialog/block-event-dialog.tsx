"use client"

import { useMutation } from "@tanstack/react-query"
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

import { BlockEventForm } from "@/components/client/block-event-form/block-event-form"
import {
    blockEventFormStateToBlock,
    initialBlockEventFormState,
} from "@/components/client/block-event-form/block-event-form.state"
import { api } from "@/lib/api/client-api"
import { useMutationFeedback } from "@/lib/hooks/use-mutation-feedback"

interface BlockEventDialogProps {
    trigger: ReactElement
    event: { id: string; title: string }
}

export const BlockEventDialog = (props: BlockEventDialogProps) => {
    const { t } = useTranslation("shared")
    const toast = useToast()
    const [open, setOpen] = useState(false)
    const [pending, setPending] = useState(false)

    const onOpenChange = (nextOpen: boolean) => {
        if (!nextOpen && pending) {
            toast.addPlain("warning", t("Backoffice.Events.Toast.CloseWhileBlocking"))
            return
        }
        setOpen(nextOpen)
    }

    return (
        <DialogRoot open={open} onOpenChange={onOpenChange}>
            <DialogTrigger render={props.trigger} />
            <DialogContent className="max-h-[calc(min(30rem,90dvh))] w-[calc(min(30rem,90dvw))]">
                <BlockEventDialogContent
                    event={props.event}
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

interface BlockEventDialogContentProps {
    event: { id: string; title: string }
    onMutate: () => void
    onSettled: () => void
    onSuccess: () => void
}

const BlockEventDialogContent = (props: BlockEventDialogContentProps) => {
    const { t, i18n } = useTranslation("shared")
    const toast = useToast()
    const feedback = useMutationFeedback()
    const { formId, form, setForm, errors, convert } = useForm(
        initialBlockEventFormState,
        blockEventFormStateToBlock,
        i18n,
    )
    const { mutate, isPending } = useMutation(api.blockEventMutation)

    const handleSubmit = () => {
        const result = convert(form)
        if (!result.success) {
            toast.add("form-validation-error")
            return
        }
        props.onMutate()
        mutate(
            { id: props.event.id, body: result.value },
            {
                onSettled: props.onSettled,
                onSuccess: () => {
                    feedback.succeeded(
                        t("Backoffice.Events.Toast.Blocked", {
                            title: props.event.title,
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
                <DialogTitle>{t("Backoffice.Events.Block.Title")}</DialogTitle>
            </DialogHeader>
            <DialogBody>
                <DialogDescription>
                    {t("Backoffice.Events.Block.Description", {
                        title: props.event.title,
                    })}
                </DialogDescription>
                <Form
                    id={formId}
                    mode="edit"
                    noValidate={true}
                    onSubmit={handleSubmit}
                    className="mt-4 flex flex-col gap-4"
                >
                    <BlockEventForm
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
                    {t("Backoffice.Events.Block.Submit")}
                </Button>
            </DialogFooter>
        </>
    )
}
