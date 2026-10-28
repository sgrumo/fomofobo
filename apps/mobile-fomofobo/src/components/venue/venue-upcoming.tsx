import { localTimeOf, weekdayDateOf } from "domain/local-format"
import { occurrenceStatus } from "domain/occurrence-status"
import { PLATFORM_TIME_ZONE } from "domain/platform"
import type { OccurrenceRef, OccurrenceSummary } from "models"
import { useLanguage } from "react-i18n/hooks"
import { useTranslation } from "react-i18next"
import { Pressable, View } from "react-native"

import { Badge } from "@/components/ui/badge/badge"
import { PixelPanel } from "@/components/ui/pixel-panel/pixel-panel"
import { Text } from "@/components/ui/text/text"
import { useNow } from "@/lib/hooks/use-now"

const CLOCK_TICK_MS = 60_000

interface UpcomingRowProps {
    occurrence: OccurrenceSummary
    now: Date
    onOpen: (ref: OccurrenceRef) => void
}

const UpcomingRow = (props: UpcomingRowProps) => {
    const { t } = useTranslation("shared")
    const language = useLanguage()
    const occurrence = props.occurrence
    const startsAt = new Date(occurrence.startsAt)
    const status = occurrenceStatus(
        { startsAt, endsAt: new Date(occurrence.endsAt) },
        props.now,
    )
    const when = `${weekdayDateOf(startsAt, PLATFORM_TIME_ZONE, language)} ${localTimeOf(startsAt, PLATFORM_TIME_ZONE)}`

    return (
        <PixelPanel shadow="md">
            <Pressable
                accessibilityRole="link"
                accessibilityLabel={`${occurrence.title}, ${when}`}
                className="gap-1 p-3"
                onPress={() => {
                    props.onOpen({ eventId: occurrence.eventId, date: occurrence.date })
                }}
            >
                <Badge tone={status} dot={true} className="self-start">
                    {t(`Status.${status}`)}
                </Badge>
                <Text variant="pixel-lg" className="uppercase">
                    {occurrence.title}
                </Text>
                <Text variant="pixel-sm" className="uppercase">
                    {when}
                </Text>
            </Pressable>
        </PixelPanel>
    )
}

interface VenueUpcomingProps {
    upcoming: readonly OccurrenceSummary[]
    onOpenEvent: (ref: OccurrenceRef) => void
}

export const VenueUpcoming = (props: VenueUpcomingProps) => {
    const { t } = useTranslation("shared")
    const now = useNow(CLOCK_TICK_MS)

    return (
        <View className="gap-3">
            <Text variant="pixel-md" accessibilityRole="header" className="uppercase">
                {t("Venue.Upcoming")}
            </Text>
            {props.upcoming.length === 0 ? (
                <Text variant="body-md" className="text-fg-muted">
                    {t("Venue.NoUpcoming")}
                </Text>
            ) : (
                props.upcoming.map(occurrence => (
                    <UpcomingRow
                        key={occurrence.eventId}
                        occurrence={occurrence}
                        now={now}
                        onOpen={props.onOpenEvent}
                    />
                ))
            )}
        </View>
    )
}
