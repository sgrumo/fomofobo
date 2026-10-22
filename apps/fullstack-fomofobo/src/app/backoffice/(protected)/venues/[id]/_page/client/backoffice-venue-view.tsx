"use client"

import { useMutation, useQuery } from "@tanstack/react-query"
import type { Venue } from "models"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useForm } from "react-shared"
import { Alert } from "ui-components/alert"
import { AlertConfirmationDialog } from "ui-components/alert-dialog"
import { Button } from "ui-components/button"
import { Field } from "ui-components/field"
import { Form } from "ui-components/form"
import { Select } from "ui-components/select"
import { Spinner } from "ui-components/spinner"
import { useToast } from "ui-components/toast"

import { useBackofficeAccount } from "@/components/client/backoffice-shell/backoffice-shell.context"
import { BlockVenueDialog } from "@/components/client/block-venue-dialog/block-venue-dialog"
import { VenueCoverEditor } from "@/components/client/venue-cover-editor/venue-cover-editor"
import { VenueForm } from "@/components/client/venue-form/venue-form"
import {
    venueFormStateFromVenue,
    venueFormStateToUpdate,
} from "@/components/client/venue-form/venue-form.state"
import { VenueKindForm } from "@/components/client/venue-kind-form/venue-kind-form"
import {
    venueKindFormStateFromVenue,
    venueKindFormStateToChange,
} from "@/components/client/venue-kind-form/venue-kind-form.state"
import { useDynamicRoute } from "@/framework/routes/route-hooks/use-dynamic-route"
import { RouteLink } from "@/framework/routes/route-link/route-link"
import { routes } from "@/framework/routes/routes"
import type { RouteClientComponentProps } from "@/framework/routes/routes"
import { api } from "@/lib/api/client-api"
import { ORGANIZER_PICKER_SIZE } from "@/lib/backoffice/lists"
import { useMutationFeedback } from "@/lib/hooks/use-mutation-feedback"

export const BackofficeVenueView = (
    props: RouteClientComponentProps<"backofficeVenue">,
) => {
    const { t } = useTranslation("shared")
    const account = useBackofficeAccount()
    const { parameters } = useDynamicRoute(routes[props.route])
    const {
        data: venue,
        isPending,
        isError,
    } = useQuery(api.getVenueQuery({ params: { id: parameters.id }, query: {} }))

    if (isPending) {
        return <Spinner title={t("Backoffice.List.Loading")} />
    }
    if (isError) {
        return <Alert type="error" text={t("Backoffice.Errors.VenueNotFound")} />
    }
    const isAdmin = account.role === "admin"
    const canEdit = isAdmin || venue.owner?.id === account.id

    return (
        <section className="flex max-w-2xl flex-col gap-4">
            <RouteLink
                route={routes.backofficeVenues}
                parameters={{}}
                query={{}}
                className="tp-body-sm underline"
            >
                {t("Backoffice.Venue.Back")}
            </RouteLink>
            <h1 className="tp-pixel-xl">{venue.name}</h1>
            {venue.isBlocked && (
                <Alert
                    type="warning"
                    text={
                        venue.blockReason === null
                            ? t("Backoffice.Venue.Blocked")
                            : t("Backoffice.Venue.BlockedWithReason", {
                                  reason: venue.blockReason,
                              })
                    }
                />
            )}
            {!canEdit && <Alert type="info" text={t("Backoffice.Venue.ReadOnly")} />}
            {isAdmin && <VenueAdminPanel venue={venue} />}
            <VenueCoverEditor venue={venue} disabled={!canEdit} />
            <VenueProfileEditor key={venue.id} venue={venue} disabled={!canEdit} />
        </section>
    )
}

interface VenueProfileEditorProps {
    venue: Venue
    disabled: boolean
}

const VenueProfileEditor = (props: VenueProfileEditorProps) => {
    const { t, i18n } = useTranslation("shared")
    const toast = useToast()
    const feedback = useMutationFeedback()
    const { formId, form, setForm, errors, convert } = useForm(
        () => venueFormStateFromVenue(props.venue),
        venueFormStateToUpdate,
        i18n,
    )
    const { mutate, isPending } = useMutation(api.updateVenueMutation)

    const handleSubmit = () => {
        const result = convert(form)
        if (!result.success) {
            toast.add("form-validation-error")
            return
        }
        mutate(
            { id: props.venue.id, body: result.value },
            {
                onSuccess: venue => {
                    feedback.succeeded(
                        t("Backoffice.Venues.Toast.Updated", { name: venue.name }),
                    )
                },
                onError: feedback.failed,
            },
        )
    }

    return (
        <>
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
                    intent="update"
                    disabled={props.disabled || isPending}
                />
            </Form>
            {!props.disabled && (
                <Button
                    variant="primary"
                    size="md"
                    type="submit"
                    form={formId}
                    loading={isPending}
                    className="self-start"
                >
                    {t("Backoffice.Actions.Save")}
                </Button>
            )}
        </>
    )
}

interface VenueAdminPanelProps {
    venue: Venue
}

const VenueAdminPanel = (props: VenueAdminPanelProps) => {
    const { t } = useTranslation("shared")
    const feedback = useMutationFeedback()
    const [ownerId, setOwnerId] = useState(props.venue.owner?.id)
    const organizers = useQuery(
        api.listOrganizersQuery({
            params: {},
            query: {
                page: 1,
                pageSize: ORGANIZER_PICKER_SIZE,
                q: undefined,
                isBlocked: undefined,
            },
        }),
    )
    const setOwner = useMutation(api.setVenueOwnerMutation)
    const ownerOptions = organizers.data?.items ?? []
    const isPermanent = props.venue.kind !== "regular"

    return (
        <div className="border-line flex flex-col gap-3 border-2 p-3">
            <h2 className="tp-pixel-md">{t("Backoffice.Venue.Admin")}</h2>
            {props.venue.owner === null ? (
                <VenueKindEditor key={props.venue.id} venue={props.venue} />
            ) : (
                <Alert type="info" text={t("Backoffice.Venue.OwnedKind")} />
            )}
            <div className="flex flex-wrap items-end gap-2">
                <Field
                    label={t("Backoffice.Venue.Owner")}
                    description={
                        isPermanent
                            ? t("Backoffice.Venue.PermanentOwnerHint")
                            : t("Backoffice.Venue.OwnerHint")
                    }
                    required={false}
                    className="w-64"
                >
                    <Select
                        multiple={false}
                        resettable={true}
                        items={ownerOptions}
                        getItemId={organizer => organizer.id}
                        renderItem={({ item }) => item.name}
                        placeholder={t("Backoffice.Venue.NoOwner")}
                        value={ownerOptions.find(organizer => organizer.id === ownerId)}
                        onValueChange={organizer => {
                            setOwnerId(organizer?.id)
                        }}
                        disabled={isPermanent || setOwner.isPending}
                    />
                </Field>
                <Button
                    variant="secondary"
                    size="md"
                    loading={setOwner.isPending}
                    disabled={isPermanent || ownerId === props.venue.owner?.id}
                    onClick={() => {
                        setOwner.mutate(
                            { id: props.venue.id, body: { ownerId: ownerId ?? null } },
                            {
                                onSuccess: venue => {
                                    feedback.succeeded(
                                        t("Backoffice.Venues.Toast.Updated", {
                                            name: venue.name,
                                        }),
                                    )
                                },
                                onError: feedback.failed,
                            },
                        )
                    }}
                >
                    {t("Backoffice.Venue.SaveOwner")}
                </Button>
            </div>
            <div>
                {props.venue.isBlocked ? (
                    <AlertConfirmationDialog
                        type="mutation"
                        trigger={
                            <Button variant="secondary" size="md">
                                {t("Backoffice.Actions.Unblock")}
                            </Button>
                        }
                        title={t("Backoffice.Venues.Unblock.Title")}
                        description={t("Backoffice.Venues.Unblock.Description", {
                            name: props.venue.name,
                        })}
                        confirmLabel={t("Backoffice.Actions.Unblock")}
                        pendingWarning={t("Backoffice.Venues.Toast.CloseWhileUnblocking")}
                        mutationOptions={api.unblockVenueMutation}
                        variables={{ id: props.venue.id }}
                        mutateOptions={{
                            onSuccess: () => {
                                feedback.succeeded(
                                    t("Backoffice.Venues.Toast.Unblocked", {
                                        name: props.venue.name,
                                    }),
                                )
                            },
                            onError: feedback.failed,
                        }}
                    />
                ) : (
                    <BlockVenueDialog
                        venue={props.venue}
                        trigger={
                            <Button variant="secondary" size="md">
                                {t("Backoffice.Actions.Block")}
                            </Button>
                        }
                    />
                )}
            </div>
        </div>
    )
}

interface VenueKindEditorProps {
    venue: Venue
}

const VenueKindEditor = (props: VenueKindEditorProps) => {
    const { t, i18n } = useTranslation("shared")
    const toast = useToast()
    const feedback = useMutationFeedback()
    const categories = useQuery(api.listCategoriesQuery({ params: {}, query: {} }))
    const { formId, form, setForm, errors, convert } = useForm(
        () => venueKindFormStateFromVenue(props.venue),
        venueKindFormStateToChange,
        i18n,
    )
    const { mutate, isPending } = useMutation(api.setVenueKindMutation)

    const handleSubmit = () => {
        const result = convert(form)
        if (!result.success) {
            toast.add("form-validation-error")
            return
        }
        mutate(
            { id: props.venue.id, body: result.value },
            {
                onSuccess: venue => {
                    feedback.succeeded(
                        t("Backoffice.Venues.Toast.Updated", { name: venue.name }),
                    )
                },
                onError: feedback.failed,
            },
        )
    }

    return (
        <Form
            id={formId}
            mode="edit"
            noValidate={true}
            onSubmit={handleSubmit}
            className="flex flex-col gap-3"
        >
            <VenueKindForm
                value={form}
                onValueChange={setForm}
                errors={errors}
                categories={categories.data ?? []}
                disabled={isPending}
            />
            <Button
                variant="secondary"
                size="md"
                type="submit"
                form={formId}
                loading={isPending}
                className="self-start"
            >
                {t("Backoffice.VenueKindForm.Save")}
            </Button>
        </Form>
    )
}
