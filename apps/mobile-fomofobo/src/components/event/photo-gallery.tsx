import type { PhotoTone } from "domain/photo-tone"
import type { EventPhoto } from "models"
import type { ReactNode } from "react"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { ScrollView, View } from "react-native"

import { Badge } from "@/components/ui/badge/badge"
import { TonedPhoto } from "@/components/ui/toned-photo/toned-photo"

interface PhotoGalleryProps {
    title: string
    photos: readonly EventPhoto[]
    coverPhotoUrl: string
    tone: PhotoTone
    controls: ReactNode
}

export const PhotoGallery = (props: PhotoGalleryProps) => {
    const { t } = useTranslation("shared")
    const [index, setIndex] = useState(0)
    const [pageWidth, setPageWidth] = useState(0)

    return (
        <View className="overflow-hidden rounded-lg border-2 border-line bg-surface-inverse">
            <ScrollView
                horizontal={true}
                pagingEnabled={true}
                showsHorizontalScrollIndicator={false}
                accessibilityLabel={t("Detail.Gallery", { title: props.title })}
                onLayout={event => {
                    setPageWidth(event.nativeEvent.layout.width)
                }}
                onMomentumScrollEnd={event => {
                    setIndex(Math.round(event.nativeEvent.contentOffset.x / pageWidth))
                }}
            >
                {props.photos.length === 0 ? (
                    <View style={{ width: pageWidth }}>
                        <TonedPhoto
                            uri={props.coverPhotoUrl}
                            tone={props.tone}
                            label={t("Detail.Cover", { title: props.title })}
                            className="aspect-[4/3] w-full"
                        />
                    </View>
                ) : (
                    props.photos.map((photo, position) => (
                        <View key={photo.id} style={{ width: pageWidth }}>
                            <TonedPhoto
                                uri={photo.url}
                                tone={props.tone}
                                label={t("Detail.Photo", {
                                    index: position + 1,
                                    total: props.photos.length,
                                })}
                                className="aspect-[4/3] w-full"
                            />
                        </View>
                    ))
                )}
            </ScrollView>
            <View className="absolute inset-x-3 top-3 flex-row justify-between">
                {props.controls}
            </View>
            {props.photos.length > 0 && (
                <Badge className="absolute bottom-3 left-3">
                    {t("Detail.PhotoCounter", {
                        index: index + 1,
                        total: props.photos.length,
                    })}
                </Badge>
            )}
        </View>
    )
}
