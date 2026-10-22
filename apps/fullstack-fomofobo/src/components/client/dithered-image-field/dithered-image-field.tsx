"use client"

import { noop } from "es-toolkit"
import { ditheredPhotoContentTypeSchema, photoContentTypeSchema } from "models"
import type { PhotoUploadRequest, PresignedUpload } from "models"
import Image from "next/image"
import type { ChangeEvent } from "react"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Button } from "ui-components/button"
import { Field } from "ui-components/field"
import { Spinner } from "ui-components/spinner"
import { useToast } from "ui-components/toast"

import { ditherPhoto } from "@/lib/upload/dither-photo"
import { uploadToPresignedUrl } from "@/lib/upload/upload-to-presigned-url"
import { validatePhotoFile } from "@/lib/upload/validate-photo-file"

const PHOTO_ACCEPT = photoContentTypeSchema.options.join(",")

interface DitheredImageFieldProps {
    copy: {
        label: string
        hint: string
        none: string
        upload: string
        remove: string
        saving: string
    }
    imageUrl: string | null
    disabled: boolean
    saving: boolean
    createTicket: (request: PhotoUploadRequest) => Promise<PresignedUpload>
    onSave: (key: string | null) => void
}

export const DitheredImageField = (props: DitheredImageFieldProps) => {
    const { t } = useTranslation("shared")
    const toast = useToast()
    const [uploading, setUploading] = useState(false)
    const busy = uploading || props.saving

    const upload = async (file: File) => {
        setUploading(true)
        try {
            const dithered = await ditherPhoto(file)
            const ticket = await props.createTicket({
                fileName: file.name,
                contentType: ditheredPhotoContentTypeSchema.enum["image/png"],
                sizeBytes: dithered.size,
            })
            await uploadToPresignedUrl(ticket, dithered, noop)
            props.onSave(ticket.key)
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
        void upload(file)
    }

    return (
        <Field label={props.copy.label} description={props.copy.hint} required={false}>
            <div className="flex flex-col gap-3">
                {props.imageUrl === null ? (
                    <p className="tp-body-sm">{props.copy.none}</p>
                ) : (
                    <Image
                        src={props.imageUrl}
                        width={320}
                        height={240}
                        unoptimized={true}
                        alt={props.copy.label}
                        className="aspect-[4/3] w-80 max-w-full object-cover"
                    />
                )}
                {busy && <Spinner title={props.copy.saving} />}
                <div className="flex flex-wrap items-center gap-2">
                    <input
                        type="file"
                        accept={PHOTO_ACCEPT}
                        aria-label={props.copy.upload}
                        disabled={props.disabled || busy}
                        onChange={handleFile}
                        className="tp-body-sm file:border-line file:bg-surface file:tp-pixel-sm file:mr-2 file:border-2 file:px-3 file:py-1"
                    />
                    {props.imageUrl !== null && (
                        <Button
                            variant="secondary"
                            size="sm"
                            disabled={props.disabled || busy}
                            onClick={() => {
                                props.onSave(null)
                            }}
                        >
                            {props.copy.remove}
                        </Button>
                    )}
                </div>
            </div>
        </Field>
    )
}
