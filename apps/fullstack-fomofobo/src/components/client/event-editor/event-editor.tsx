"use client"

import { useMutation, useQuery } from "@tanstack/react-query"
import type { Event } from "models"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useForm } from "react-shared"
import { Alert } from "ui-components/alert"
import { AlertConfirmationDialog } from "ui-components/alert-dialog"
import { Button } from "ui-components/button"
import { Field } from "ui-components/field"
import { Form } from "ui-components/form"
import { useToast } from "ui-components/toast"

import { useBackofficeAccount } from "@/components/client/backoffice-shell/backoffice-shell.context"
import { EventForm } from "@/components/client/event-form/event-form"
import {
    eventFormReducer,
    eventFormStateFromEvent,
    eventFormStateToUpsert,
    initialEventFormState,
} from "@/components/client/event-form/event-form.state"
import { PhotoGalleryEditor } from "@/components/client/photo-gallery-editor/photo-gallery-editor"
import { routes } from "@/framework/routes/routes"
import { api } from "@/lib/api/client-api"
import { ORGANIZER_PICKER_SIZE } from "@/lib/backoffice/lists"
import { useMutationFeedback } from "@/lib/hooks/use-mutation-feedback"

const VENUE_PICKER_SIZE = 100
const EVENTS_PATH = routes.backofficeEvents.path({ parameters: {}, query: {} })

interface EventEditorProps {
    event?: Event
}

export const EventEditor = (props: EventEditorProps) => {
    const { t, i18n } = useTranslation("shared")
    const router = useRouter()
    const toast = useToast()
    const feedback = useMutationFeedback()
    const account = useBackofficeAccount()
    const isAdmin = account.role === "admin"
    const initial =
        props.event === undefined
            ? initialEventFormState()
            : eventFormStateFromEvent(props.event)
    const { formId, form, setForm, errors, convert } = useForm(
        initial,
        eventFormStateToUpsert,
        i18n,
        { isAdmin },
    )
    const [saved, setSaved] = useState(false)
    const [leaving, setLeaving] = useState(false)
    const dirty = !saved && JSON.stringify(form) !== JSON.stringify(initial)

    useEffect(() => {
        if (!dirty) {
            return undefined
        }
        const warn = (event: BeforeUnloadEvent) => {
            event.preventDefault()
        }
        globalThis.addEventListener("beforeunload", warn)
        return () => {
            globalThis.removeEventListener("beforeunload", warn)
        }
    }, [dirty])

    const categories = useQuery(api.listCategoriesQuery({ params: {}, query: {} }))
    const venues = useQuery(
        api.listVenuesQuery({
            params: {},
            query: { page: 1, pageSize: VENUE_PICKER_SIZE, q: undefined },
        }),
    )
    const organizers = useQuery({
        ...api.listOrganizersQuery({
            params: {},
            query: {
                page: 1,
                pageSize: ORGANIZER_PICKER_SIZE,
                q: undefined,
                isBlocked: undefined,
            },
        }),
        enabled: isAdmin,
    })

    const create = useMutation(api.createEventMutation)
    const update = useMutation(api.updateEventMutation)
    const isPending = create.isPending || update.isPending

    const handleSubmit = () => {
        const result = convert(form)
        if (!result.success) {
            toast.add("form-validation-error")
            return
        }
        const onSuccess = (event: Event) => {
            feedback.succeeded(t("Backoffice.EventEditor.Saved", { title: event.title }))
            setSaved(true)
            router.push(EVENTS_PATH)
        }
        if (props.event === undefined) {
            create.mutate(result.value, { onSuccess, onError: feedback.failed })
            return
        }
        update.mutate(
            { id: props.event.id, body: result.value },
            { onSuccess, onError: feedback.failed },
        )
    }

    return (
        <section className="flex max-w-3xl flex-col gap-4">
            <h1 className="tp-pixel-xl">
                {props.event === undefined
                    ? t("Backoffice.EventEditor.NewTitle")
                    : t("Backoffice.EventEditor.EditTitle")}
            </h1>
            {/* PLACEHOLDER(OP-22): an edit keeps the block */}
            {props.event?.isBlocked === true && (
                <Alert
                    type="warning"
                    text={
                        props.event.blockReason === null
                            ? t("Backoffice.EventEditor.Blocked")
                            : t("Backoffice.EventEditor.BlockedWithReason", {
                                  reason: props.event.blockReason,
                              })
                    }
                />
            )}
            <Form
                id={formId}
                mode="edit"
                noValidate={true}
                onSubmit={handleSubmit}
                className="flex flex-col gap-4"
            >
                <EventForm
                    value={form}
                    onValueChange={setForm}
                    errors={errors}
                    categories={categories.data ?? []}
                    venues={(venues.data?.items ?? []).map(venue => ({
                        id: venue.id,
                        name: venue.name,
                    }))}
                    organizers={
                        isAdmin
                            ? (organizers.data?.items ?? []).map(organizer => ({
                                  id: organizer.id,
                                  name: organizer.name,
                              }))
                            : undefined
                    }
                    disabled={isPending}
                />
                {/* PLACEHOLDER(OP-13): 1 to `MAX_EVENT_PHOTOS` photos */}
                <Field
                    label={t("Backoffice.Photos.Label")}
                    description={t("Backoffice.Photos.Hint")}
                    required={true}
                    errors={errors?.photos?.errors}
                >
                    <PhotoGalleryEditor
                        value={form.photos ?? []}
                        onValueChange={change => {
                            setForm(previous =>
                                eventFormReducer(previous, {
                                    type: "photos",
                                    value: change(previous.photos ?? []),
                                }),
                            )
                        }}
                        disabled={isPending}
                    />
                </Field>
            </Form>
            <div className="flex flex-wrap gap-2">
                <Button
                    variant="primary"
                    size="md"
                    type="submit"
                    form={formId}
                    loading={isPending}
                >
                    {t("Backoffice.Actions.Save")}
                </Button>
                {dirty ? (
                    <AlertConfirmationDialog
                        type="controlled"
                        open={leaving}
                        onOpenChange={setLeaving}
                        trigger={
                            <Button variant="secondary" size="md" disabled={isPending}>
                                {t("Backoffice.Actions.Cancel")}
                            </Button>
                        }
                        title={t("Backoffice.EventEditor.Leave.Title")}
                        description={t("Backoffice.EventEditor.Leave.Description")}
                        confirmLabel={t("Backoffice.EventEditor.Leave.Confirm")}
                        onConfirm={() => {
                            setSaved(true)
                            router.push(EVENTS_PATH)
                        }}
                    />
                ) : (
                    <Button
                        variant="secondary"
                        size="md"
                        disabled={isPending}
                        onClick={() => {
                            router.push(EVENTS_PATH)
                        }}
                    >
                        {t("Backoffice.Actions.Cancel")}
                    </Button>
                )}
            </div>
        </section>
    )
}
