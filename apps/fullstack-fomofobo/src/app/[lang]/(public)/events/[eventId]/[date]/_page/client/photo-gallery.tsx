"use client"

import type { EventPhoto } from "models"
import type { ReactNode } from "react"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Badge } from "ui-components/badge"
import { DitheredImage } from "ui-components/dithered-image"

import type { RouteClientComponentProps } from "@/framework/routes/routes"

interface PhotoGalleryProps extends RouteClientComponentProps<"eventDetail"> {
    title: string
    photos: EventPhoto[]
    controls: ReactNode
}

export const PhotoGallery = (props: PhotoGalleryProps) => {
    const { t } = useTranslation("shared")
    const [index, setIndex] = useState(0)

    return (
        <div className="border-line bg-surface-inverse relative overflow-hidden rounded-lg border-2">
            <div
                role="group"
                aria-label={t("Detail.Gallery", { title: props.title })}
                className="flex aspect-[4/3] snap-x snap-mandatory [scrollbar-width:none] overflow-x-auto"
                onScroll={event => {
                    const strip = event.currentTarget
                    setIndex(Math.round(strip.scrollLeft / strip.clientWidth))
                }}
            >
                {props.photos.map((photo, position) => (
                    <DitheredImage
                        key={photo.id}
                        src={photo.url}
                        alt={t("Detail.Photo", {
                            index: position + 1,
                            total: props.photos.length,
                        })}
                        className="size-full shrink-0 snap-center object-cover"
                    />
                ))}
            </div>
            <div className="absolute inset-x-3 top-3 flex justify-between">
                {props.controls}
            </div>
            {props.photos.length === 0 ? undefined : (
                <Badge tone="neutral" className="absolute bottom-3 left-3">
                    {t("Detail.PhotoCounter", {
                        index: index + 1,
                        total: props.photos.length,
                    })}
                </Badge>
            )}
        </div>
    )
}
