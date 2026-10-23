import { localTimeOf } from "domain/local-format"
import { occurrenceFactsOf } from "domain/occurrence-facts"
import { occurrenceProgress } from "domain/occurrence-progress"
import { occurrenceStatus } from "domain/occurrence-status"
import { PLATFORM_TIME_ZONE } from "domain/platform"
import { router } from "expo-router"
import type { OccurrenceDetail } from "models"
import { useLanguage } from "react-i18n/hooks"
import { useTranslation } from "react-i18next"
import { ScrollView, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { match } from "ts-pattern"

import { PhotoGallery } from "@/components/event/photo-gallery"
import { PriceDetails } from "@/components/event/price-details"
import { Badge } from "@/components/ui/badge/badge"
import { IconButton } from "@/components/ui/icon-button/icon-button"
import { StatGrid } from "@/components/ui/stat-grid/stat-grid"
import { Text } from "@/components/ui/text/text"
import { Timeline } from "@/components/ui/timeline/timeline"
import { useNow } from "@/lib/hooks/use-now"
import { usePriceSummary } from "@/lib/hooks/use-price-summary"
import { backToMap } from "@/lib/navigation/back-to-map"

const CLOCK_TICK_MS = 60_000

interface EventDetailProps {
    occurrence: OccurrenceDetail
}

export const EventDetail = (props: EventDetailProps) => {
    const { t } = useTranslation("shared")
    const language = useLanguage()
    const insets = useSafeAreaInsets()
    const now = useNow(CLOCK_TICK_MS)
    const priceSummary = usePriceSummary()

    const occurrence = props.occurrence
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
                value: `${time.start}→${time.end}`,
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
        <View className="flex-1 bg-surface">
            <ScrollView
                className="flex-1"
                contentContainerClassName="gap-5 p-4"
                contentContainerStyle={{ paddingTop: insets.top + 8 }}
            >
                <PhotoGallery
                    title={occurrence.title}
                    photos={occurrence.photos}
                    coverPhotoUrl={occurrence.coverPhotoUrl}
                    controls={
                        <IconButton
                            icon="back"
                            label={t("Detail.Back")}
                            onPress={backToMap}
                        />
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
                                router.push({
                                    pathname: "/venues/[venueId]",
                                    params: { venueId: occurrence.venue.id },
                                })
                            }}
                        >
                            {occurrence.venue.name}
                        </Text>
                    )}
                    <Text variant="body-md" className="text-fg-muted">
                        {occurrence.venue.address}
                    </Text>
                </View>
            </ScrollView>
            <View
                className="absolute inset-x-0 top-0 bg-surface"
                style={{ height: insets.top }}
            />
        </View>
    )
}
