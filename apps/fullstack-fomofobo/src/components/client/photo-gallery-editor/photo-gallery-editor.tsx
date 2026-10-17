"use client"

import type { PhotoContentType } from "models"
import { MAX_EVENT_PHOTOS, photoContentTypeSchema } from "models"
import Image from "next/image"
import type { ChangeEvent } from "react"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Badge } from "ui-components/badge"
import { Button } from "ui-components/button"
import { useFieldContext } from "ui-components/field"
import { Progress } from "ui-components/progress"
import { useToast } from "ui-components/toast"

import type { EventFormPhoto } from "@/components/client/event-form/event-form.state"
import { api } from "@/lib/api/client-api"
import { uploadToPresignedUrl } from "@/lib/upload/upload-to-presigned-url"
import { validatePhotoFile } from "@/lib/upload/validate-photo-file"

const PHOTO_ACCEPT = photoContentTypeSchema.options.join(",")

interface PendingUpload {
    id: string
    name: string
    share: number
}

interface PhotoGalleryEditorProps {
    value: EventFormPhoto[]
    onValueChange: (update: (photos: EventFormPhoto[]) => EventFormPhoto[]) => void
    disabled?: boolean
}

/**
 * @description Returns the photos with the photo at the index moved by the offset
 * @param photos Photos in gallery order
 * @param index Position of the photo moved
 * @param offset `-1` to move it earlier, `1` to move it later
 */
const movePhoto = (
    photos: EventFormPhoto[],
    index: number,
    offset: -1 | 1,
): EventFormPhoto[] => {
    const target = index + offset
    const moved = photos[index]
    const swapped = photos[target]
    return moved === undefined || swapped === undefined
        ? photos
        : photos.map((photo, position) =>
              position === index ? swapped : position === target ? moved : photo,
          )
}

/**
 * @description Uploads the photo through an upload ticket of the session, and returns its key and a local preview URL
 * @param file Photo picked
 * @param contentType Content type the validation read
 * @param onProgress Receives the share of the file sent
 */
const uploadPhoto = async (
    file: File,
    contentType: PhotoContentType,
    onProgress: (share: number) => void,
): Promise<EventFormPhoto> => {
    const ticket = await api.createPhotoUploadTicket({
        params: {},
        body: { fileName: file.name, contentType, sizeBytes: file.size },
    })
    await uploadToPresignedUrl(ticket, file, onProgress)
    return { key: ticket.key, url: URL.createObjectURL(file) }
}

export const PhotoGalleryEditor = (props: PhotoGalleryEditorProps) => {
    const { t } = useTranslation("shared")
    const toast = useToast()
    const field = useFieldContext()
    const [pending, setPending] = useState<PendingUpload[]>([])

    const startUpload = async (file: File, contentType: PhotoContentType) => {
        const id = crypto.randomUUID()
        setPending(uploads => [...uploads, { id, name: file.name, share: 0 }])
        try {
            const photo = await uploadPhoto(file, contentType, share => {
                setPending(uploads =>
                    uploads.map(item => (item.id === id ? { ...item, share } : item)),
                )
            })
            props.onValueChange(photos => [...photos, photo])
        } catch {
            toast.add({
                type: "error",
                error: {
                    type: "generic",
                    messages: [t("Backoffice.Photos.Failed", { name: file.name })],
                },
            })
        } finally {
            setPending(uploads => uploads.filter(item => item.id !== id))
        }
    }

    const handleFiles = (event: ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files ?? [])
        event.target.value = ""
        const free = MAX_EVENT_PHOTOS - props.value.length - pending.length
        if (files.length > free) {
            toast.add({
                type: "error",
                error: {
                    type: "generic",
                    messages: [t("Backoffice.Photos.TooMany", { max: MAX_EVENT_PHOTOS })],
                },
            })
        }

        for (const file of files.slice(0, Math.max(free, 0))) {
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
                continue
            }

            void startUpload(file, validation.value)
        }
    }

    return (
        <div className="flex flex-col gap-3">
            <ol className="grid grid-cols-[repeat(auto-fill,minmax(10rem,1fr))] gap-3">
                {props.value.map((photo, index) => (
                    <li
                        key={photo.key}
                        className="border-line flex flex-col gap-2 border-2 p-2"
                    >
                        <Image
                            src={photo.url}
                            width={320}
                            height={240}
                            unoptimized={true}
                            alt={t("Backoffice.Photos.Photo", { index: index + 1 })}
                            className="aspect-[4/3] w-full object-cover"
                        />
                        {index === 0 && (
                            <Badge tone="inverse" className="w-fit">
                                {t("Backoffice.Photos.Cover")}
                            </Badge>
                        )}
                        <div className="flex flex-wrap gap-1">
                            <Button
                                variant="tertiary"
                                size="sm"
                                disabled={props.disabled === true || index === 0}
                                aria-label={t("Backoffice.Photos.MoveEarlier", {
                                    index: index + 1,
                                })}
                                onClick={() => {
                                    props.onValueChange(photos =>
                                        movePhoto(photos, index, -1),
                                    )
                                }}
                            >
                                ←
                            </Button>
                            <Button
                                variant="tertiary"
                                size="sm"
                                disabled={
                                    props.disabled === true ||
                                    index === props.value.length - 1
                                }
                                aria-label={t("Backoffice.Photos.MoveLater", {
                                    index: index + 1,
                                })}
                                onClick={() => {
                                    props.onValueChange(photos =>
                                        movePhoto(photos, index, 1),
                                    )
                                }}
                            >
                                →
                            </Button>
                            <Button
                                variant="secondary"
                                size="sm"
                                disabled={props.disabled}
                                aria-label={t("Backoffice.Photos.Remove", {
                                    index: index + 1,
                                })}
                                onClick={() => {
                                    props.onValueChange(photos =>
                                        photos.filter(item => item.key !== photo.key),
                                    )
                                }}
                            >
                                {t("Backoffice.Actions.Delete")}
                            </Button>
                        </div>
                    </li>
                ))}
            </ol>
            {pending.length > 0 && (
                <ul className="flex flex-col gap-2">
                    {pending.map(item => (
                        <li key={item.id} className="flex flex-col gap-1">
                            <span className="tp-body-sm">
                                {t("Backoffice.Photos.Uploading", { name: item.name })}
                            </span>
                            <Progress
                                value={item.share * 100}
                                min={0}
                                max={100}
                                aria-label={t("Backoffice.Photos.Uploading", {
                                    name: item.name,
                                })}
                            />
                        </li>
                    ))}
                </ul>
            )}
            <input
                id={field?.inputId}
                type="file"
                accept={PHOTO_ACCEPT}
                multiple={true}
                disabled={props.disabled}
                onChange={handleFiles}
                className="tp-body-sm file:border-line file:bg-surface file:tp-pixel-sm file:mr-2 file:border-2 file:px-3 file:py-1"
            />
        </div>
    )
}
