import { useInfiniteQuery } from "@tanstack/react-query"
import { historyDatesOf, VENUE_HISTORY_PAGE_SIZE } from "domain/venue-history"
import type { VenueHistoryItem } from "models"
import { useTranslation } from "react-i18next"
import { View } from "react-native"

import { Button } from "@/components/ui/button/button"
import { Notice } from "@/components/ui/notice/notice"
import { Text } from "@/components/ui/text/text"
import { api } from "@/lib/api/client"

interface HistoryRowProps {
    item: VenueHistoryItem
}

const HistoryRow = (props: HistoryRowProps) => (
    <View className="gap-1 border-b-2 border-line pb-2">
        <Text variant="pixel-sm" className="uppercase text-fg-muted">
            {historyDatesOf(props.item)}
        </Text>
        <Text variant="body-md">{props.item.title}</Text>
    </View>
)

interface VenueHistoryProps {
    venueId: string
}

export const VenueHistory = (props: VenueHistoryProps) => {
    const { t } = useTranslation("shared")
    const {
        data: history,
        isPending: historyPending,
        isError: historyFailed,
        isFetchNextPageError: moreFailed,
        isFetchingNextPage: moreLoading,
        hasNextPage: hasMore,
        fetchNextPage,
        refetch,
    } = useInfiniteQuery(
        api.listVenueHistoryInfiniteQuery({
            params: { venueId: props.venueId },
            pageSize: VENUE_HISTORY_PAGE_SIZE,
        }),
    )
    const items = (history?.pages ?? []).flatMap(page => page.items)

    const body = historyPending ? (
        <Notice tone="loading" lines={[t("Venue.HistoryLoading")]} />
    ) : historyFailed && history === undefined ? (
        <View className="gap-3">
            <Notice tone="error" lines={[t("Venue.HistoryError")]} />
            <Button
                variant="secondary"
                className="self-start"
                accessibilityLabel={t("Detail.Retry")}
                onPress={() => {
                    void refetch()
                }}
            >
                <Text>{t("Detail.Retry")}</Text>
            </Button>
        </View>
    ) : items.length === 0 ? (
        <Text variant="body-md" className="text-fg-muted">
            {t("Venue.NoHistory")}
        </Text>
    ) : (
        <View className="gap-2">
            {items.map(item => (
                <HistoryRow key={item.eventId} item={item} />
            ))}
            {moreFailed && <Notice tone="error" lines={[t("Venue.HistoryError")]} />}
            {hasMore && (
                <Button
                    variant="secondary"
                    size="sm"
                    className="self-start"
                    disabled={moreLoading}
                    accessibilityLabel={t("Venue.More")}
                    onPress={() => {
                        void fetchNextPage()
                    }}
                >
                    <Text>
                        {moreLoading ? t("Venue.HistoryLoading") : t("Venue.More")}
                    </Text>
                </Button>
            )}
        </View>
    )

    return (
        <View className="gap-3">
            <Text variant="pixel-md" accessibilityRole="header" className="uppercase">
                {t("Venue.History")}
            </Text>
            {body}
        </View>
    )
}
