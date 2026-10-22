"use client"

import { useMutation } from "@tanstack/react-query"
import type { Venue } from "models"
import { useTranslation } from "react-i18next"

import { DitheredImageField } from "@/components/client/dithered-image-field/dithered-image-field"
import { api } from "@/lib/api/client-api"
import { useMutationFeedback } from "@/lib/hooks/use-mutation-feedback"

interface VenueCoverEditorProps {
    venue: Venue
    disabled: boolean
}

export const VenueCoverEditor = (props: VenueCoverEditorProps) => {
    const { t } = useTranslation("shared")
    const feedback = useMutationFeedback()
    const { mutate: updateVenue, isPending } = useMutation(api.updateVenueMutation)

    return (
        <DitheredImageField
            copy={{
                label: t("Backoffice.VenueCover.Label"),
                hint: t("Backoffice.VenueCover.Hint"),
                none: t("Backoffice.VenueCover.None"),
                upload: t("Backoffice.VenueCover.Upload"),
                remove: t("Backoffice.VenueCover.Remove"),
                saving: t("Backoffice.VenueCover.Saving"),
            }}
            imageUrl={props.venue.coverPhotoUrl}
            disabled={props.disabled}
            saving={isPending}
            createTicket={body =>
                api.createVenueCoverUploadTicket({ params: { id: props.venue.id }, body })
            }
            onSave={coverPhotoKey => {
                updateVenue(
                    { id: props.venue.id, body: { coverPhotoKey } },
                    {
                        onSuccess: () => {
                            feedback.succeeded(
                                t("Backoffice.Venues.Toast.Updated", {
                                    name: props.venue.name,
                                }),
                            )
                        },
                        onError: feedback.failed,
                    },
                )
            }}
        />
    )
}
