"use client"

import type { PhotoTone } from "domain/photo-tone"
import { cn } from "frontend-shared/styles"
import type { EventPhoto } from "models"
import type { ReactNode } from "react"
import { useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { Badge } from "ui-components/badge"
import { IconButton } from "ui-components/icon-button"
import { PixelIconBack } from "ui-components/pixel-icons"

import { TonedImage } from "@/components/client/toned-image/toned-image"

interface PhotoGalleryProps {
    title: string
    photos: EventPhoto[]
    coverPhotoUrl: string
    coverNaturalUrl: string | null
    tone: PhotoTone
    controls: ReactNode
}

export const PhotoGallery = (props: PhotoGalleryProps) => {
    const { t } = useTranslation("shared")
    const [index, setIndex] = useState(0)
    const stripRef = useRef<HTMLDivElement>(null)
    const showPhoto = (target: number) => {
        const strip = stripRef.current
        strip?.scrollTo({ left: target * strip.clientWidth, behavior: "smooth" })
    }

    return (
        <div className="border-line bg-surface-inverse relative overflow-hidden rounded-lg border-2">
            <div
                ref={stripRef}
                role="group"
                aria-label={t("Detail.Gallery", { title: props.title })}
                className="flex aspect-[4/3] snap-x snap-mandatory [scrollbar-width:none] overflow-x-auto"
                onScroll={event => {
                    const strip = event.currentTarget
                    setIndex(Math.round(strip.scrollLeft / strip.clientWidth))
                }}
            >
                {props.photos.length === 0 ? (
                    <TonedImage
                        tone={props.tone}
                        src={props.coverPhotoUrl}
                        naturalSrc={props.coverNaturalUrl}
                        width={1200}
                        height={900}
                        loading="eager"
                        alt={t("Detail.Cover", { title: props.title })}
                        className={cn("size-full shrink-0 object-cover", {
                            "[image-rendering:pixelated]": props.coverNaturalUrl === null,
                        })}
                    />
                ) : undefined}
                {props.photos.map((photo, position) => (
                    <TonedImage
                        tone={props.tone}
                        key={photo.id}
                        src={photo.url}
                        naturalSrc={photo.naturalUrl}
                        width={1200}
                        height={900}
                        loading={position === 0 ? "eager" : "lazy"}
                        alt={t("Detail.Photo", {
                            index: position + 1,
                            total: props.photos.length,
                        })}
                        className={cn("size-full shrink-0 snap-center object-cover", {
                            "[image-rendering:pixelated]": photo.naturalUrl === null,
                        })}
                    />
                ))}
            </div>
            <div className="absolute inset-x-3 top-3 flex justify-between">
                {props.controls}
            </div>
            {props.photos.length > 1 ? (
                <div className="pointer-events-none absolute inset-x-3 top-1/2 flex -translate-y-1/2 justify-between [&>*]:pointer-events-auto">
                    <IconButton
                        aria-label={t("Detail.PreviousPhoto")}
                        icon={<PixelIconBack />}
                        size="sm"
                        disabled={index === 0}
                        onClick={() => {
                            showPhoto(index - 1)
                        }}
                    />
                    <IconButton
                        aria-label={t("Detail.NextPhoto")}
                        icon={<PixelIconBack className="rotate-180" />}
                        size="sm"
                        disabled={index === props.photos.length - 1}
                        onClick={() => {
                            showPhoto(index + 1)
                        }}
                    />
                </div>
            ) : undefined}
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
