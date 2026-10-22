"use client"

import { useMutation } from "@tanstack/react-query"
import { noop } from "es-toolkit"
import { ditheredPhotoContentTypeSchema, photoContentTypeSchema } from "models"
import type { Venue } from "models"
import Image from "next/image"
import type { ChangeEvent } from "react"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Button } from "ui-components/button"
import { Field } from "ui-components/field"
import { Spinner } from "ui-components/spinner"
import { useToast } from "ui-components/toast"

import { api } from "@/lib/api/client-api"
import { useMutationFeedback } from "@/lib/hooks/use-mutation-feedback"
import { ditherPhoto } from "@/lib/upload/dither-photo"
import { uploadToPresignedUrl } from "@/lib/upload/upload-to-presigned-url"
import { validatePhotoFile } from "@/lib/upload/validate-photo-file"

const PHOTO_ACCEPT = photoContentTypeSchema.options.join(",")

interface VenueCoverEditorProps {
    venue: Venue
    disabled: boolean
}

export const VenueCoverEditor = (props: VenueCoverEditorProps) => {
    const { t } = useTranslation("shared")
    const toast = useToast()
    const feedback = useMutationFeedback()
    const [uploading, setUploading] = useState(false)
    const { mutate: updateVenue, isPending } = useMutation(api.updateVenueMutation)
    const busy = uploading || isPending

    const saveCover = (coverPhotoKey: string | null) => {
        updateVenue(
            { id: props.venue.id, body: { coverPhotoKey } },
            {
                onSuccess: () => {
                    feedback.succeeded(
                        t("Backoffice.Venues.Toast.Updated", { name: props.venue.name }),
                    )
                },
                onError: feedback.failed,
            },
        )
    }

    const uploadCover = async (file: File) => {
        setUploading(true)
        try {
            const dithered = await ditherPhoto(file)
            const ticket = await api.createVenueCoverUploadTicket({
                params: { id: props.venue.id },
                body: {
                    fileName: file.name,
                    contentType: ditheredPhotoContentTypeSchema.enum["image/png"],
                    sizeBytes: dithered.size,
                },
            })
            await uploadToPresignedUrl(ticket, dithered, noop)
            saveCover(ticket.key)
        } catch {
            toast.add({
                type: "error",
                error: {
                    type: "generic",
                    messages: [t("Backoffice.Photos.Failed", { name: file.name })],
                },
            })
        } finally {
            setUploading(false)
        }
    }

    const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        event.target.value = ""
        if (file === undefined) {
            return
        }
        const validation = validatePhotoFile(file)
        if (!validation.success) {
            toast.add({
                type: "error",
                error: {
                    type: "generic",
                    messages: [
                        t(`Backoffice.Photos.Invalid.${validation.error}`, {
                            name: file.name,
                        }),
                    ],
                },
            })
            return
        }
        void uploadCover(file)
    }

    return (
        <Field
            label={t("Backoffice.VenueCover.Label")}
            description={t("Backoffice.VenueCover.Hint")}
            required={false}
        >
            <div className="flex flex-col gap-3">
                {props.venue.coverPhotoUrl === null ? (
                    <p className="tp-body-sm">{t("Backoffice.VenueCover.None")}</p>
                ) : (
                    <Image
                        src={props.venue.coverPhotoUrl}
                        width={320}
                        height={240}
                        unoptimized={true}
                        alt={t("Backoffice.VenueCover.Label")}
                        className="aspect-[4/3] w-80 max-w-full object-cover"
                    />
                )}
                {busy && <Spinner title={t("Backoffice.VenueCover.Saving")} />}
                <div className="flex flex-wrap items-center gap-2">
                    <input
                        type="file"
                        accept={PHOTO_ACCEPT}
                        aria-label={t("Backoffice.VenueCover.Upload")}
                        disabled={props.disabled || busy}
                        onChange={handleFile}
                        className="tp-body-sm file:border-line file:bg-surface file:tp-pixel-sm file:mr-2 file:border-2 file:px-3 file:py-1"
                    />
                    {props.venue.coverPhotoUrl !== null && (
                        <Button
                            variant="secondary"
                            size="sm"
                            disabled={props.disabled || busy}
                            onClick={() => {
                                saveCover(null)
                            }}
                        >
                            {t("Backoffice.VenueCover.Remove")}
                        </Button>
                    )}
                </div>
            </div>
        </Field>
    )
}
