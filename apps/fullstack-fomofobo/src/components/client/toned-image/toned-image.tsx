"use client"

import { photoToneMatrix } from "domain/photo-tone"
import type { PhotoTone } from "domain/photo-tone"
import Image from "next/image"
import { useId } from "react"

interface TonedImageProps {
    src: string
    // The original of the photo, drawn as it is in place of the toned dither
    naturalSrc?: string | null
    tone: PhotoTone
    width: number
    height: number
    alt: string
    loading?: "eager" | "lazy"
    className?: string
}

// A stored photo is ink and red, so the live tone draws it as it is
export const TonedImage = (props: TonedImageProps) => {
    const filterId = useId()
    if (typeof props.naturalSrc === "string") {
        return (
            <Image
                src={props.naturalSrc}
                width={props.width}
                height={props.height}
                unoptimized={true}
                loading={props.loading}
                alt={props.alt}
                className={props.className}
            />
        )
    }
    const image = (
        <Image
            src={props.src}
            width={props.width}
            height={props.height}
            unoptimized={true}
            loading={props.loading}
            alt={props.alt}
            className={props.className}
            style={props.tone === "live" ? undefined : { filter: `url(#${filterId})` }}
        />
    )

    if (props.tone === "live") {
        return image
    }

    return (
        <>
            <svg aria-hidden={true} className="absolute size-0">
                <filter id={filterId}>
                    <feColorMatrix type="matrix" values={photoToneMatrix(props.tone)} />
                </filter>
            </svg>
            {image}
        </>
    )
}
