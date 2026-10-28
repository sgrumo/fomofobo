import { venueDetailUrlOf } from "domain/detail-urls"
import { venuePhotoToneOf } from "domain/photo-tone"
import type { PixelIconName } from "domain/pixel-icons"
import { venueShareTextOf } from "domain/share-summary"
import type { PublicVenue } from "models"
import { useLanguage } from "react-i18n/hooks"
import { useTranslation } from "react-i18next"
import { Linking, ScrollView, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { DirectionsButton } from "@/components/links/directions-button"
import { ShareRow } from "@/components/links/share-row"
import { Badge } from "@/components/ui/badge/badge"
import { Button } from "@/components/ui/button/button"
import { IconButton } from "@/components/ui/icon-button/icon-button"
import { Text } from "@/components/ui/text/text"
import { TonedPhoto } from "@/components/ui/toned-photo/toned-photo"
import { VenueHistory } from "@/components/venue/venue-history"
import { VenueUpcoming } from "@/components/venue/venue-upcoming"
import { env } from "@/lib/env"
import { backToMap } from "@/lib/navigation/back-to-map"

interface VenueLinkButtonProps {
    url: string
    label: string
    icon: PixelIconName
}

const VenueLinkButton = (props: VenueLinkButtonProps) => (
    <Button
        variant="accent"
        size="sm"
        icon={props.icon}
        accessibilityRole="link"
        accessibilityLabel={props.label}
        onPress={() => {
            void Linking.openURL(props.url)
        }}
    >
        <Text>{props.label}</Text>
    </Button>
)

interface VenueLink {
    url: string | null
    label: string
    icon: PixelIconName
}

interface VenueDetailProps {
    venue: PublicVenue
}

export const VenueDetail = (props: VenueDetailProps) => {
    const { t } = useTranslation("shared")
    const language = useLanguage()
    const insets = useSafeAreaInsets()
    const venue = props.venue
    const programmeUrl = venue.programmeUrl
    const links: readonly VenueLink[] = [
        { url: venue.links.websiteUrl, label: t("Venue.Website"), icon: "link" },
        {
            url: venue.links.instagramUrl,
            label: t("Detail.Instagram"),
            icon: "instagram",
        },
        { url: venue.links.facebookUrl, label: t("Detail.Facebook"), icon: "facebook" },
    ]

    return (
        <View className="flex-1 bg-surface">
            <ScrollView
                className="flex-1"
                contentContainerClassName="gap-5 p-4"
                contentContainerStyle={{
                    paddingTop: insets.top + 8,
                    paddingBottom: insets.bottom + 16,
                }}
            >
                <View className="flex-row">
                    <IconButton
                        icon="back"
                        label={t("Detail.Back")}
                        onPress={backToMap}
                    />
                </View>
                {venue.coverPhotoUrl !== null && (
                    <TonedPhoto
                        uri={venue.coverPhotoUrl}
                        tone={venuePhotoToneOf(venue.kind)}
                        label={t("Venue.Cover", { name: venue.name })}
                        className="aspect-[4/3] w-full rounded-md border-2 border-line"
                    />
                )}
                <View className="gap-2">
                    {venue.kind !== "regular" && (
                        <Badge tone="permanent" className="self-start">
                            {t(`VenueKind.${venue.kind}`)}
                        </Badge>
                    )}
                    <Text
                        variant="pixel-2xl"
                        accessibilityRole="header"
                        className="uppercase"
                    >
                        {venue.name}
                    </Text>
                    <Text variant="body-md" className="text-fg-muted">
                        {venue.address}
                    </Text>
                    {venue.description !== null && (
                        <Text variant="body-lg">{venue.description}</Text>
                    )}
                </View>
                <View className="flex-row flex-wrap gap-3">
                    {programmeUrl !== null && (
                        <Button
                            variant="secondary"
                            size="sm"
                            className="bg-permanent"
                            accessibilityRole="link"
                            accessibilityLabel={t("Preview.Programme")}
                            onPress={() => {
                                void Linking.openURL(programmeUrl)
                            }}
                        >
                            <Text>{t("Preview.Programme")}</Text>
                        </Button>
                    )}
                    <DirectionsButton coordinates={venue.coordinates} />
                    {links.map(link =>
                        link.url === null ? undefined : (
                            <VenueLinkButton
                                key={link.icon}
                                url={link.url}
                                label={link.label}
                                icon={link.icon}
                            />
                        ),
                    )}
                </View>
                <VenueUpcoming upcoming={venue.upcoming} />
                <VenueHistory venueId={venue.id} />
                <ShareRow
                    url={venueDetailUrlOf(env.apiUrl, language, venue.id)}
                    text={venueShareTextOf(venue)}
                />
            </ScrollView>
            <View
                className="absolute inset-x-0 top-0 bg-surface"
                style={{ height: insets.top }}
            />
        </View>
    )
}
