import { queryOptions, useQuery } from "@tanstack/react-query"
import { photoToneMatrix } from "domain/photo-tone"
import type { PhotoTone } from "domain/photo-tone"
import { Image } from "expo-image"
import { useId } from "react"
import { View } from "react-native"
import Svg, { Defs, FeColorMatrix, Filter, Image as SvgImage } from "react-native-svg"

import { DitheredPhoto } from "@/components/ui/dithered-photo/dithered-photo"
import { cn } from "@/lib/utils/class-names"

import { tonedPhotoStyles } from "./toned-photo.styles"

/**
 * @description Builds the query of the local file of a photo in the disk cache of `expo-image`, which keeps it for offline reads
 * @param uri Remote photo
 */
const cachedFileQuery = (uri: string) =>
    queryOptions({
        queryKey: ["toned-photo-file", uri],
        queryFn: async () => {
            await Image.prefetch(uri, { cachePolicy: "disk" })
            const path = await Image.getCachePathAsync(uri)
            return path === null ? null : `file://${path}`
        },
        // A photo cached offline still resolves
        networkMode: "always",
        staleTime: Infinity,
        retry: false,
    })

interface TonedPhotoProps {
    uri: string
    tone: PhotoTone
    // Absent on a decorative photo
    label?: string
    className?: string
}

// A stored photo is ink and red, so the live tone draws it as it is. Any other tone runs it through
// an SVG color matrix, which `expo-image` cannot apply.
const TonedPhoto = (props: TonedPhotoProps) => {
    const id = useId()
    const { data: file, isError: fileFailed } = useQuery({
        ...cachedFileQuery(props.uri),
        enabled: props.tone !== "live",
    })

    if (props.tone === "live" || file === null || fileFailed) {
        return (
            <DitheredPhoto
                uri={props.uri}
                label={props.label}
                className={props.className}
            />
        )
    }

    return (
        <View
            accessible={props.label !== undefined}
            accessibilityRole={props.label === undefined ? undefined : "image"}
            accessibilityLabel={props.label}
            className={cn(tonedPhotoStyles, props.className)}
        >
            {file !== undefined && (
                <Svg width="100%" height="100%">
                    <Defs>
                        <Filter id={id}>
                            <FeColorMatrix
                                type="matrix"
                                values={photoToneMatrix(props.tone)}
                            />
                        </Filter>
                    </Defs>
                    <SvgImage
                        href={file}
                        width="100%"
                        height="100%"
                        preserveAspectRatio="xMidYMid slice"
                        filter={`url(#${id})`}
                    />
                </Svg>
            )}
        </View>
    )
}

export { TonedPhoto }
