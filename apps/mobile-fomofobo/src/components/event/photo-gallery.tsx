import type { PhotoTone } from "domain/photo-tone"
import type { EventPhoto } from "models"
import type { ReactNode } from "react"
import { useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { ScrollView, View } from "react-native"

import { Badge } from "@/components/ui/badge/badge"
import { IconButton } from "@/components/ui/icon-button/icon-button"
import { TonedPhoto } from "@/components/ui/toned-photo/toned-photo"

interface PhotoGalleryProps {
    title: string
    photos: readonly EventPhoto[]
    coverPhotoUrl: string
    coverNaturalUrl: string | null
    tone: PhotoTone
    controls: ReactNode
}

export const PhotoGallery = (props: PhotoGalleryProps) => {
    const { t } = useTranslation("shared")
    const [index, setIndex] = useState(0)
    const [pageWidth, setPageWidth] = useState(0)
    const scrollRef = useRef<ScrollView>(null)
    // Sets the index at once: Android ends a programmatic scroll with no momentum event
    const showPhoto = (target: number) => {
        setIndex(target)
        scrollRef.current?.scrollTo({ x: target * pageWidth, animated: true })
    }

    return (
        <View className="overflow-hidden rounded-lg border-2 border-line bg-surface-inverse">
            <ScrollView
                ref={scrollRef}
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
                            naturalUri={props.coverNaturalUrl}
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
                                naturalUri={photo.naturalUrl}
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
            {props.photos.length > 1 && (
                <View
                    pointerEvents="box-none"
                    className="absolute inset-x-3 inset-y-0 flex-row items-center justify-between"
                >
                    <IconButton
                        icon="back"
                        label={t("Detail.PreviousPhoto")}
                        size="sm"
                        disabled={index === 0}
                        onPress={() => {
                            showPhoto(index - 1)
                        }}
                    />
                    <IconButton
                        icon="back"
                        mirrored={true}
                        label={t("Detail.NextPhoto")}
                        size="sm"
                        disabled={index === props.photos.length - 1}
                        onPress={() => {
                            showPhoto(index + 1)
                        }}
                    />
                </View>
            )}
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
