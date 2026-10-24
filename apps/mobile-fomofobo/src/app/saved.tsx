import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { localTimeOf, weekdayDateOf } from "domain/local-format"
import { occurrenceStatus } from "domain/occurrence-status"
import { PLATFORM_TIME_ZONE } from "domain/platform"
import { router, Stack } from "expo-router"
import type { OccurrenceSummary } from "models"
import { useLanguage } from "react-i18n/hooks"
import { useTranslation } from "react-i18next"
import { Pressable, ScrollView, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { SaveToggle } from "@/components/saves/save-toggle"
import { Badge } from "@/components/ui/badge/badge"
import { Button } from "@/components/ui/button/button"
import { IconButton } from "@/components/ui/icon-button/icon-button"
import { Notice } from "@/components/ui/notice/notice"
import { PixelPanel } from "@/components/ui/pixel-panel/pixel-panel"
import { Text } from "@/components/ui/text/text"
import { api } from "@/lib/api/client"
import { useNow } from "@/lib/hooks/use-now"
import { useSavedEvents } from "@/lib/hooks/use-saved-events"
import { backToMap } from "@/lib/navigation/back-to-map"

const CLOCK_TICK_MS = 60_000

interface SavedRowProps {
    occurrence: OccurrenceSummary
    now: Date
}

const SavedRow = (props: SavedRowProps) => {
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
            <View className="flex-row items-start gap-3 p-3">
                <Pressable
                    accessibilityRole="link"
                    accessibilityLabel={`${occurrence.title}, ${occurrence.venue.name}, ${when}`}
                    className="min-w-0 flex-1 gap-1"
                    onPress={() => {
                        router.push({
                            pathname: "/events/[eventId]/[date]",
                            params: {
                                eventId: occurrence.eventId,
                                date: occurrence.date,
                            },
                        })
                    }}
                >
                    <Badge tone={status} dot={true} className="self-start">
                        {t(`Status.${status}`)}
                    </Badge>
                    <Text variant="pixel-lg" className="uppercase">
                        {occurrence.title}
                    </Text>
                    <Text variant="body-md" className="text-fg-muted">
                        {occurrence.venue.name}
                    </Text>
                    <Text variant="pixel-sm" className="uppercase">
                        {when}
                    </Text>
                </Pressable>
                <SaveToggle occurrence={occurrence} size="sm" />
            </View>
        </PixelPanel>
    )
}

const SavedScreen = () => {
    const { t } = useTranslation("shared")
    const insets = useSafeAreaInsets()
    const now = useNow(CLOCK_TICK_MS)
    const savedEvents = useSavedEvents()

    const newestFirst = savedEvents.events.toSorted((first, second) =>
        second.savedAt.localeCompare(first.savedAt),
    )
    const {
        data: lookup,
        isPending: lookupPending,
        isError: lookupFailed,
        refetch,
    } = useQuery({
        ...api.lookupOccurrencesQuery({
            params: {},
            query: { ref: newestFirst.map(saved => `${saved.eventId}:${saved.date}`) },
        }),
        enabled: newestFirst.length > 0,
        placeholderData: keepPreviousData,
    })
    // An unsaved event leaves the list at once, before the next lookup answers.
    const savedIds = new Set(newestFirst.map(saved => saved.eventId))
    const occurrences = (lookup ?? []).filter(occurrence =>
        savedIds.has(occurrence.eventId),
    )

    const body =
        newestFirst.length === 0 ? (
            <Text variant="body-md" className="text-fg-muted">
                {t("Saved.Empty")}
            </Text>
        ) : lookupFailed && lookup === undefined ? (
            <View className="gap-3">
                <Notice tone="error" lines={[t("Saved.Error")]} />
                <Button
                    variant="secondary"
                    className="self-start"
                    accessibilityLabel={t("Saved.Retry")}
                    onPress={() => {
                        void refetch()
                    }}
                >
                    <Text>{t("Saved.Retry")}</Text>
                </Button>
            </View>
        ) : lookupPending ? (
            <Notice tone="loading" lines={[t("Saved.Loading")]} />
        ) : occurrences.length === 0 ? (
            <Text variant="body-md" className="text-fg-muted">
                {t("Saved.NoneVisible")}
            </Text>
        ) : (
            <View className="gap-3">
                {occurrences.map(occurrence => (
                    <SavedRow
                        key={`${occurrence.eventId}:${occurrence.date}`}
                        occurrence={occurrence}
                        now={now}
                    />
                ))}
            </View>
        )

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <ScrollView
                className="flex-1 bg-surface"
                contentContainerClassName="gap-4 p-4"
                contentContainerStyle={{
                    paddingTop: insets.top + 8,
                    paddingBottom: insets.bottom + 16,
                }}
            >
                <View className="flex-row items-center gap-3">
                    <IconButton
                        icon="back"
                        label={t("Detail.Back")}
                        onPress={backToMap}
                    />
                    <Text
                        variant="pixel-2xl"
                        accessibilityRole="header"
                        className="uppercase"
                    >
                        {t("Saved.Title")}
                    </Text>
                </View>
                {body}
            </ScrollView>
        </>
    )
}

export default SavedScreen
