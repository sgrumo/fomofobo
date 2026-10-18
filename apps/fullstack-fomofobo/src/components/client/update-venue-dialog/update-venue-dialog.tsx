"use client"

import { useMutation } from "@tanstack/react-query"
import type { Venue } from "models"
import type { ReactElement } from "react"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useForm } from "react-shared"
import { Button } from "ui-components/button"
import {
    DialogBody,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogRoot,
    DialogTitle,
    DialogTrigger,
} from "ui-components/dialog"
import { Form } from "ui-components/form"
import { useToast } from "ui-components/toast"

import { VenueForm } from "@/components/client/venue-form/venue-form"
import {
    venueFormStateFromVenue,
    venueFormStateToCreation,
} from "@/components/client/venue-form/venue-form.state"
import { api } from "@/lib/api/client-api"
import { useMutationFeedback } from "@/lib/hooks/use-mutation-feedback"

interface UpdateVenueDialogProps {
    trigger: ReactElement
    venue: Venue
}

export const UpdateVenueDialog = (props: UpdateVenueDialogProps) => {
    const { t } = useTranslation("shared")
    const toast = useToast()
    const [open, setOpen] = useState(false)
    const [pending, setPending] = useState(false)

    const onOpenChange = (nextOpen: boolean) => {
        if (!nextOpen && pending) {
            toast.addPlain("warning", t("Backoffice.Venues.Toast.CloseWhileUpdating"))
            return
        }
        setOpen(nextOpen)
    }

    return (
        <DialogRoot open={open} onOpenChange={onOpenChange}>
            <DialogTrigger render={props.trigger} />
            <DialogContent className="max-h-[calc(min(48rem,90dvh))] w-[calc(min(40rem,90dvw))]">
                <UpdateVenueDialogContent
                    venue={props.venue}
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

interface UpdateVenueDialogContentProps {
    venue: Venue
    onMutate: () => void
    onSettled: () => void
    onSuccess: () => void
}

const UpdateVenueDialogContent = (props: UpdateVenueDialogContentProps) => {
    const { t, i18n } = useTranslation("shared")
    const toast = useToast()
    const feedback = useMutationFeedback()
    const { formId, form, setForm, errors, convert } = useForm(
        () => venueFormStateFromVenue(props.venue),
        venueFormStateToCreation,
        i18n,
    )
    const { mutate, isPending } = useMutation(api.updateVenueMutation)

    const handleSubmit = () => {
        const result = convert(form)
        if (!result.success) {
            toast.add("form-validation-error")
            return
        }
        props.onMutate()
        mutate(
            { id: props.venue.id, body: result.value },
            {
                onSettled: props.onSettled,
                onSuccess: venue => {
                    feedback.succeeded(
                        t("Backoffice.Venues.Toast.Updated", { name: venue.name }),
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
                <DialogTitle>{t("Backoffice.Venues.Update.Title")}</DialogTitle>
            </DialogHeader>
            <DialogBody>
                <Form
                    id={formId}
                    mode="edit"
                    noValidate={true}
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-4"
                >
                    <VenueForm
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
                    {t("Backoffice.Actions.Save")}
                </Button>
            </DialogFooter>
        </>
    )
}
