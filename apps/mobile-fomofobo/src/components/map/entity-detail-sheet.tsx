import { useQuery } from "@tanstack/react-query"
import type { OccurrenceRef } from "models"
import { useTranslation } from "react-i18next"
import { View } from "react-native"

import { EventDetail, EventDetailActions } from "@/components/event/event-detail"
import { Button } from "@/components/ui/button/button"
import { DetailSheet } from "@/components/ui/detail-sheet/detail-sheet"
import { IconButton } from "@/components/ui/icon-button/icon-button"
import { Notice } from "@/components/ui/notice/notice"
import { Text } from "@/components/ui/text/text"
import { VenueDetail } from "@/components/venue/venue-detail"
import { isNotFoundError, retryUnlessNotFound } from "@/lib/api/api-response-error"
import { api } from "@/lib/api/client"
import { useOnline } from "@/lib/hooks/use-online"

type DetailSelection =
    | { type: "occurrence"; ref: OccurrenceRef }
    | { type: "venue"; venueId: string }

interface DetailNoticeProps {
    tone: "info" | "loading" | "error"
    message: string
    onClose: () => void
    onRetry?: () => void
}

const DetailNotice = (props: DetailNoticeProps) => {
    const { t } = useTranslation("shared")

    return (
        <View className="gap-4">
            <View className="flex-row justify-end">
                <IconButton
                    icon="close"
                    size="sm"
                    label={t("Preview.Close")}
                    onPress={props.onClose}
                />
            </View>
            <Notice tone={props.tone} lines={[props.message]} />
            {props.onRetry !== undefined && (
                <Button
                    variant="secondary"
                    className="self-start"
                    accessibilityLabel={t("Detail.Retry")}
                    onPress={props.onRetry}
                >
                    <Text>{t("Detail.Retry")}</Text>
                </Button>
            )}
        </View>
    )
}

interface EntityDetailSheetProps {
    open: boolean
    selection: DetailSelection | undefined
    onClose: () => void
    onOpenVenue: (venueId: string) => void
    onOpenEvent: (ref: OccurrenceRef) => void
}

export const EntityDetailSheet = (props: EntityDetailSheetProps) => {
    const { t } = useTranslation("shared")
    const online = useOnline()
    const selection = props.selection
    const occurrenceRef = selection?.type === "occurrence" ? selection.ref : undefined
    const venueId = selection?.type === "venue" ? selection.venueId : undefined
    const {
        data: occurrence,
        error: occurrenceError,
        refetch: refetchOccurrence,
    } = useQuery({
        ...api.getOccurrenceQuery({
            params: {
                eventId: occurrenceRef?.eventId ?? "",
                date: occurrenceRef?.date ?? "",
            },
            query: {},
        }),
        enabled: props.open && occurrenceRef !== undefined,
        retry: retryUnlessNotFound,
    })
    const {
        data: venue,
        error: venueError,
        refetch: refetchVenue,
    } = useQuery({
        ...api.getPublicVenueQuery({ params: { venueId: venueId ?? "" }, query: {} }),
        enabled: props.open && venueId !== undefined,
        retry: retryUnlessNotFound,
    })

    const isVenue = selection?.type === "venue"
    const error = isVenue ? venueError : occurrenceError
    const pending = online ? (
        error === null ? (
            <DetailNotice
                tone="loading"
                message={isVenue ? t("Venue.Loading") : t("Detail.Loading")}
                onClose={props.onClose}
            />
        ) : isNotFoundError(error) ? (
            <DetailNotice
                tone="info"
                message={isVenue ? t("Venue.NotFound") : t("Detail.NotFound")}
                onClose={props.onClose}
            />
        ) : (
            <DetailNotice
                tone="error"
                message={isVenue ? t("Venue.LoadFailed") : t("Detail.LoadFailed")}
                onClose={props.onClose}
                onRetry={() => {
                    void (isVenue ? refetchVenue() : refetchOccurrence())
                }}
            />
        )
    ) : (
        <DetailNotice
            tone="info"
            message={isVenue ? t("Venue.Offline") : t("Detail.Offline")}
            onClose={props.onClose}
        />
    )

    return (
        <DetailSheet
            open={props.open}
            onClose={props.onClose}
            footer={
                !isVenue && occurrence !== undefined ? (
                    <EventDetailActions occurrence={occurrence} />
                ) : undefined
            }
        >
            {isVenue && venue !== undefined ? (
                <VenueDetail
                    venue={venue}
                    onClose={props.onClose}
                    onOpenEvent={props.onOpenEvent}
                />
            ) : !isVenue && occurrence !== undefined ? (
                <EventDetail
                    occurrence={occurrence}
                    onClose={props.onClose}
                    onOpenVenue={props.onOpenVenue}
                />
            ) : (
                pending
            )}
        </DetailSheet>
    )
}
