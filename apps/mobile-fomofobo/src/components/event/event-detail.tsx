import { eventDetailUrlOf } from "domain/detail-urls"
import { localTimeOf } from "domain/local-format"
import { occurrenceFactsOf } from "domain/occurrence-facts"
import { occurrenceProgress } from "domain/occurrence-progress"
import { occurrenceStatus } from "domain/occurrence-status"
import { PLATFORM_TIME_ZONE } from "domain/platform"
import { occurrenceShareTextOf } from "domain/share-summary"
import type { OccurrenceDetail } from "models"
import { useLanguage } from "react-i18n/hooks"
import { useTranslation } from "react-i18next"
import { Linking, View } from "react-native"
import { match } from "ts-pattern"

import { PhotoGallery } from "@/components/event/photo-gallery"
import { PriceDetails } from "@/components/event/price-details"
import { DirectionsButton } from "@/components/links/directions-button"
import { ShareButton } from "@/components/links/share-button"
import { ShareRow } from "@/components/links/share-row"
import { SaveToggle } from "@/components/saves/save-toggle"
import { Badge } from "@/components/ui/badge/badge"
import { Button } from "@/components/ui/button/button"
import { IconButton } from "@/components/ui/icon-button/icon-button"
import { StatGrid } from "@/components/ui/stat-grid/stat-grid"
import { Text } from "@/components/ui/text/text"
import { Timeline } from "@/components/ui/timeline/timeline"
import { env } from "@/lib/env"
import { useNow } from "@/lib/hooks/use-now"
import { usePriceSummary } from "@/lib/hooks/use-price-summary"

const CLOCK_TICK_MS = 60_000

interface EventDetailProps {
    occurrence: OccurrenceDetail
    onBack: () => void
    onOpenVenue: (venueId: string) => void
}

export const EventDetail = (props: EventDetailProps) => {
    const { t } = useTranslation("shared")
    const language = useLanguage()
    const now = useNow(CLOCK_TICK_MS)
    const priceSummary = usePriceSummary()

    const occurrence = props.occurrence
    const shareUrl = eventDetailUrlOf(env.apiUrl, language, occurrence)
    const shareText = occurrenceShareTextOf(occurrence, language)
    const span = {
        startsAt: new Date(occurrence.startsAt),
        endsAt: new Date(occurrence.endsAt),
    }
    const status = occurrenceStatus(span, now)
    const startTime = localTimeOf(span.startsAt, PLATFORM_TIME_ZONE)
    const endTime = localTimeOf(span.endsAt, PLATFORM_TIME_ZONE)
    const facts = occurrenceFactsOf(occurrence, language).map(fact =>
        match(fact)
            .with({ type: "date" }, date => ({
                label: t("Detail.Date"),
                value: date.weekdayDate,
            }))
            .with({ type: "time" }, time => ({
                label: t("Detail.Time"),
                value: `${time.start} → ${time.end}`,
                fit: true,
            }))
            .with({ type: "entry" }, entry => ({
                label: t("Detail.Entry"),
                value: priceSummary(entry.priceScheme),
            }))
            .with({ type: "capacity" }, capacity => ({
                label: t("Detail.Capacity"),
                value: t("Detail.Places", { count: capacity.places }),
            }))
            .with({ type: "interested" }, interested => ({
                label: t("Detail.Interest"),
                value: t("Detail.Interested", { count: interested.count }),
            }))
            .exhaustive(),
    )

    return (
        <>
            <PhotoGallery
                title={occurrence.title}
                photos={occurrence.photos}
                tone={status}
                coverPhotoUrl={occurrence.coverPhotoUrl}
                controls={
                    <>
                        <IconButton
                            icon="back"
                            label={t("Detail.Back")}
                            onPress={props.onBack}
                        />
                        <View className="flex-row gap-2">
                            <SaveToggle occurrence={occurrence} />
                            <ShareButton url={shareUrl} text={shareText} />
                        </View>
                    </>
                }
            />
            <View className="gap-3">
                <Badge tone={status} dot={true}>
                    {t(`Status.${status}`)}
                </Badge>
                {status === "live" && (
                    <Timeline
                        label={t("Preview.Elapsed")}
                        value={occurrenceProgress(span, now) * 100}
                        min={0}
                        max={100}
                        start={startTime}
                        now={t("Detail.Now", {
                            time: localTimeOf(now, PLATFORM_TIME_ZONE),
                        })}
                        end={endTime}
                        tone="live"
                    />
                )}
            </View>
            <View className="gap-2">
                <Text
                    variant="pixel-2xl"
                    accessibilityRole="header"
                    className="uppercase"
                >
                    {occurrence.title}
                </Text>
                {occurrence.description !== null && (
                    <Text variant="body-lg" className="text-fg-muted">
                        {occurrence.description}
                    </Text>
                )}
            </View>
            <StatGrid items={facts} />
            <PriceDetails priceScheme={occurrence.priceScheme} />
            <View className="gap-1">
                <Text
                    variant="pixel-sm"
                    accessibilityRole="header"
                    className="uppercase text-fg-muted"
                >
                    {t("Detail.Venue")}
                </Text>
                {occurrence.venue.isBlocked ? (
                    <Text variant="pixel-lg">{occurrence.venue.name}</Text>
                ) : (
                    <Text
                        variant="pixel-lg"
                        accessibilityRole="link"
                        className="underline"
                        onPress={() => {
                            props.onOpenVenue(occurrence.venue.id)
                        }}
                    >
                        {occurrence.venue.name}
                    </Text>
                )}
                <Text variant="body-md" className="text-fg-muted">
                    {occurrence.venue.address}
                </Text>
            </View>
            <ShareRow url={shareUrl} text={shareText} />
        </>
    )
}

interface EventDetailActionsProps {
    occurrence: OccurrenceDetail
}

export const EventDetailActions = (props: EventDetailActionsProps) => {
    const { t } = useTranslation("shared")
    const { instagramUrl, facebookUrl } = props.occurrence.externalLinks

    return (
        <View accessibilityLabel={t("Detail.Actions")} className="flex-1 flex-row gap-3">
            <DirectionsButton
                coordinates={props.occurrence.venue.coordinates}
                className="flex-1"
            />
            {instagramUrl !== null && (
                <Button
                    variant="accent"
                    size="sm"
                    icon="instagram"
                    accessibilityRole="link"
                    accessibilityLabel={t("Detail.Instagram")}
                    className="flex-1"
                    onPress={() => {
                        void Linking.openURL(instagramUrl)
                    }}
                >
                    <Text>{t("Detail.Instagram")}</Text>
                </Button>
            )}
            {facebookUrl !== null && (
                <Button
                    variant="accent"
                    size="sm"
                    icon="facebook"
                    accessibilityRole="link"
                    accessibilityLabel={t("Detail.Facebook")}
                    className="flex-1"
                    onPress={() => {
                        void Linking.openURL(facebookUrl)
                    }}
                >
                    <Text>{t("Detail.Facebook")}</Text>
                </Button>
            )}
        </View>
    )
}
