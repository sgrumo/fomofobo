import { venueDetailUrlOf } from "domain/detail-urls"
import { venuePhotoToneOf } from "domain/photo-tone"
import { venueShareTextOf } from "domain/share-summary"
import { venueUsefulLinksOf } from "domain/useful-links"
import type { OccurrenceRef, PublicVenue } from "models"
import { useLanguage } from "react-i18n/hooks"
import { useTranslation } from "react-i18next"
import { Linking, View } from "react-native"

import { DirectionsButton } from "@/components/links/directions-button"
import { ShareMenu } from "@/components/links/share-menu"
import { UsefulLinks } from "@/components/links/useful-links"
import { Badge } from "@/components/ui/badge/badge"
import { Button } from "@/components/ui/button/button"
import { IconButton } from "@/components/ui/icon-button/icon-button"
import { Text } from "@/components/ui/text/text"
import { TonedPhoto } from "@/components/ui/toned-photo/toned-photo"
import { VenueHistory } from "@/components/venue/venue-history"
import { VenueUpcoming } from "@/components/venue/venue-upcoming"
import { env } from "@/lib/env"
import { useClosingText } from "@/lib/hooks/use-closing-text"

interface VenueDetailProps {
    venue: PublicVenue
    onClose: () => void
    onOpenEvent: (ref: OccurrenceRef) => void
}

export const VenueDetail = (props: VenueDetailProps) => {
    const { t } = useTranslation("shared")
    const language = useLanguage()
    const venue = props.venue
    const permanent = venue.kind !== "regular"
    const closingText = useClosingText()(venue)
    // The programme link of a permanent venue leads to its website
    const links = venueUsefulLinksOf(
        permanent ? { ...venue.links, websiteUrl: null } : venue.links,
    )

    return (
        <>
            <View className="z-10 flex-row justify-between">
                <IconButton
                    icon="close"
                    label={t("Preview.Close")}
                    onPress={props.onClose}
                />
                <ShareMenu
                    url={venueDetailUrlOf(env.apiUrl, language, venue.id)}
                    text={venueShareTextOf(venue)}
                />
            </View>
            {venue.coverPhotoUrl !== null && (
                <TonedPhoto
                    uri={venue.coverPhotoUrl}
                    naturalUri={venue.coverNaturalUrl}
                    tone={venuePhotoToneOf(venue.kind)}
                    label={t("Venue.Cover", { name: venue.name })}
                    className="aspect-[4/3] w-full rounded-md border-2 border-line"
                />
            )}
            <View className="gap-2">
                {permanent && (
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
                {closingText !== undefined && (
                    <Text variant="pixel-sm" className="uppercase">
                        {closingText}
                    </Text>
                )}
                {venue.description !== null && (
                    <Text variant="body-lg">{venue.description}</Text>
                )}
            </View>
            {!permanent && (
                <DirectionsButton
                    coordinates={venue.coordinates}
                    className="self-start"
                />
            )}
            <UsefulLinks links={links} />
            <VenueUpcoming upcoming={venue.upcoming} onOpenEvent={props.onOpenEvent} />
            {!permanent && <VenueHistory venueId={venue.id} />}
        </>
    )
}

interface VenueDetailActionsProps {
    venue: PublicVenue
}

export const VenueDetailActions = (props: VenueDetailActionsProps) => {
    const { t } = useTranslation("shared")
    const programmeUrl = props.venue.programmeUrl

    return (
        <View
            accessibilityLabel={t("Detail.Actions")}
            className="flex-1 flex-row flex-wrap gap-3"
        >
            {programmeUrl !== null && (
                <Button
                    variant="secondary"
                    size="sm"
                    accessibilityRole="link"
                    accessibilityLabel={t("Preview.Programme")}
                    className="grow bg-permanent"
                    onPress={() => {
                        void Linking.openURL(programmeUrl)
                    }}
                >
                    <Text>{t("Preview.Programme")}</Text>
                </Button>
            )}
            <DirectionsButton coordinates={props.venue.coordinates} className="grow" />
        </View>
    )
}
