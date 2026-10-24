import { useQuery } from "@tanstack/react-query"
import { Stack, useLocalSearchParams } from "expo-router"
import { occurrenceRefSchema } from "models"
import type { OccurrenceRef } from "models"
import { useTranslation } from "react-i18next"

import { EventDetail } from "@/components/event/event-detail"
import { OfflineScreenNotice } from "@/components/screen-notice/offline-screen-notice"
import { ScreenNotice } from "@/components/screen-notice/screen-notice"
import { isNotFoundError, retryUnlessNotFound } from "@/lib/api/api-response-error"
import { api } from "@/lib/api/client"
import { useOnline } from "@/lib/hooks/use-online"
import { backToMap } from "@/lib/navigation/back-to-map"

interface OccurrenceScreenProps {
    occurrenceRef: OccurrenceRef
}

const OccurrenceScreen = (props: OccurrenceScreenProps) => {
    const { t } = useTranslation("shared")
    const online = useOnline()
    const {
        data: occurrence,
        error: occurrenceError,
        refetch,
    } = useQuery({
        ...api.getOccurrenceQuery({ params: props.occurrenceRef, query: {} }),
        retry: retryUnlessNotFound,
    })

    if (occurrence !== undefined) {
        return <EventDetail occurrence={occurrence} />
    }
    if (!online) {
        return <OfflineScreenNotice message={t("Detail.Offline")} />
    }
    if (occurrenceError === null) {
        return <ScreenNotice tone="loading" message={t("Detail.Loading")} />
    }
    return isNotFoundError(occurrenceError) ? (
        <ScreenNotice
            tone="info"
            message={t("Detail.NotFound")}
            actions={[{ label: t("Detail.BackToMap"), onPress: backToMap }]}
        />
    ) : (
        <ScreenNotice
            tone="error"
            message={t("Detail.LoadFailed")}
            actions={[
                {
                    label: t("Detail.Retry"),
                    onPress: () => {
                        void refetch()
                    },
                },
            ]}
        />
    )
}

const EventScreen = () => {
    const { t } = useTranslation("shared")
    const occurrenceRef = occurrenceRefSchema.safeParse(useLocalSearchParams())

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            {occurrenceRef.success ? (
                <OccurrenceScreen occurrenceRef={occurrenceRef.data} />
            ) : (
                <ScreenNotice
                    tone="info"
                    message={t("Detail.NotFound")}
                    actions={[{ label: t("Detail.BackToMap"), onPress: backToMap }]}
                />
            )}
        </>
    )
}

export default EventScreen
