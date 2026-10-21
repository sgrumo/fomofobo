"use client"

import { useMutation, useQuery } from "@tanstack/react-query"
import { cn } from "frontend-shared/styles"
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
import { ToggleGroup } from "ui-components/toggle"

import { useBackofficeAccount } from "@/components/client/backoffice-shell/backoffice-shell.context"
import { CreateVenueDialog } from "@/components/client/create-venue-dialog/create-venue-dialog"
import { EventFormWizard } from "@/components/client/event-form-wizard/event-form-wizard"
import { EventForm } from "@/components/client/event-form/event-form"
import type { EventFormPhoto } from "@/components/client/event-form/event-form.state"
import {
    eventFormReducer,
    eventFormStateFromEvent,
    eventFormStateToUpsert,
    initialEventFormState,
} from "@/components/client/event-form/event-form.state"
import { routes } from "@/framework/routes/routes"
import { api } from "@/lib/api/client-api"
import { ORGANIZER_PICKER_SIZE } from "@/lib/backoffice/lists"
import { useLocalStorage } from "@/lib/hooks/use-local-storage"
import { useMutationFeedback } from "@/lib/hooks/use-mutation-feedback"
import { localStorageSchema } from "@/lib/storage/local-storage"

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
    const [mode, setMode] = useLocalStorage("event-form-mode")
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

    const venueOptions = (venues.data?.items ?? []).map(venue => ({
        id: venue.id,
        name: venue.name,
    }))
    const organizerOptions = isAdmin
        ? (organizers.data?.items ?? []).map(organizer => ({
              id: organizer.id,
              name: organizer.name,
          }))
        : undefined
    const onPhotosChange = (change: (photos: EventFormPhoto[]) => EventFormPhoto[]) => {
        setForm(previous =>
            eventFormReducer(previous, {
                type: "photos",
                value: change(previous.photos ?? []),
            }),
        )
    }

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
            <Field label={t("Backoffice.EventEditor.Mode.Label")} required={false}>
                <ToggleGroup
                    multiple={false}
                    itemSchema={localStorageSchema["event-form-mode"]}
                    items={localStorageSchema["event-form-mode"].options}
                    getItemLabel={item => t(`Backoffice.EventEditor.Mode.${item}`)}
                    value={mode}
                    onValueChange={next => {
                        // A press on the current mode untoggles it, and the mode stays
                        if (next !== undefined) {
                            setMode(next)
                        }
                    }}
                    className="flex w-fit items-center gap-2"
                    renderItem={({ item, toggled }) => (
                        <span
                            className={cn(
                                "tp-pixel-md rounded-full border px-3 py-1 transition-colors",
                                toggled
                                    ? "border-line bg-surface-inverse text-fg-inverse"
                                    : "border-line-muted bg-surface text-fg hover:bg-surface-muted",
                            )}
                        >
                            {t(`Backoffice.EventEditor.Mode.${item}`)}
                        </span>
                    )}
                />
            </Field>
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
            {/* PLACEHOLDER(OP-20): outside the form, whose submit a dialog form would reach through the portal */}
            <div className="flex flex-wrap items-center gap-2">
                <span className="tp-body-sm">
                    {t("Backoffice.EventEditor.MissingVenue")}
                </span>
                <CreateVenueDialog
                    trigger={
                        <Button variant="tertiary" size="sm" disabled={isPending}>
                            {t("Backoffice.Venues.New")}
                        </Button>
                    }
                    onCreated={venue => {
                        setForm(previous =>
                            eventFormReducer(previous, {
                                type: "venue",
                                value: { id: venue.id, name: venue.name },
                            }),
                        )
                    }}
                />
            </div>
            {mode === "wizard" ? (
                <EventFormWizard
                    value={form}
                    onValueChange={setForm}
                    errors={errors}
                    categories={categories.data ?? []}
                    venues={venueOptions}
                    organizers={organizerOptions}
                    onPhotosChange={onPhotosChange}
                    disabled={isPending}
                    saving={isPending}
                    onSave={handleSubmit}
                />
            ) : (
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
                        venues={venueOptions}
                        organizers={organizerOptions}
                        onPhotosChange={onPhotosChange}
                        disabled={isPending}
                    />
                </Form>
            )}
            <div className="flex flex-wrap gap-2">
                {mode === "form" ? (
                    <Button
                        variant="primary"
                        size="md"
                        type="submit"
                        form={formId}
                        loading={isPending}
                    >
                        {t("Backoffice.Actions.Save")}
                    </Button>
                ) : undefined}
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
