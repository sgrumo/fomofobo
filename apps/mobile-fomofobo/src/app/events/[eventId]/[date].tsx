import { useQuery } from "@tanstack/react-query"
import { Stack, useLocalSearchParams } from "expo-router"
import { occurrenceRefSchema } from "models"
import type { OccurrenceRef } from "models"
import { useTranslation } from "react-i18next"

import { EventDetail } from "@/components/event/event-detail"
import { ScreenNotice } from "@/components/screen-notice/screen-notice"
import { isNotFoundError, retryUnlessNotFound } from "@/lib/api/api-response-error"
import { api } from "@/lib/api/client"
import { backToMap } from "@/lib/navigation/back-to-map"

interface OccurrenceScreenProps {
    occurrenceRef: OccurrenceRef
}

const OccurrenceScreen = (props: OccurrenceScreenProps) => {
    const { t } = useTranslation("shared")
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
    if (occurrenceError === null) {
        return <ScreenNotice tone="loading" message={t("Detail.Loading")} />
    }
    return isNotFoundError(occurrenceError) ? (
        <ScreenNotice
            tone="info"
            message={t("Detail.NotFound")}
            action={{ label: t("Detail.BackToMap"), onPress: backToMap }}
        />
    ) : (
        <ScreenNotice
            tone="error"
            message={t("Detail.LoadFailed")}
            action={{
                label: t("Detail.Retry"),
                onPress: () => {
                    void refetch()
                },
            }}
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
                    action={{ label: t("Detail.BackToMap"), onPress: backToMap }}
                />
            )}
        </>
    )
}

export default EventScreen
