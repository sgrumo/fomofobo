import { Image } from "expo-image"
import type { ImageContentFit } from "expo-image"
import { cssInterop } from "nativewind"

import { cn } from "@/lib/utils/class-names"

import { ditheredPhotoStyles } from "./dithered-photo.styles"

cssInterop(Image, { className: "style" })

interface DitheredPhotoProps {
    uri: string
    // Absent on a decorative photo
    label?: string
    contentFit?: ImageContentFit
    className?: string
}

// PLACEHOLDER(TQ-32): the stored two-color dither, with the default filtering of `expo-image`,
// which offers no nearest-neighbor scaling
const DitheredPhoto = (props: DitheredPhotoProps) => (
    <Image
        source={{ uri: props.uri }}
        contentFit={props.contentFit ?? "cover"}
        accessible={props.label !== undefined}
        accessibilityLabel={props.label}
        className={cn(ditheredPhotoStyles, props.className)}
    />
)

export { DitheredPhoto }
