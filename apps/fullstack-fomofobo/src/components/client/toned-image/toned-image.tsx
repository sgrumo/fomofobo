"use client"

import { photoToneMatrix } from "domain/photo-tone"
import type { PhotoTone } from "domain/photo-tone"
import Image from "next/image"
import { useId } from "react"

interface TonedImageProps {
    src: string
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
