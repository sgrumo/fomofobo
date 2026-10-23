import { useQuery } from "@tanstack/react-query"
import { Stack, useLocalSearchParams } from "expo-router"
import { HttpStatus, occurrenceRefSchema } from "models"
import type { OccurrenceRef } from "models"
import { useTranslation } from "react-i18next"
import { View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { EventDetail } from "@/components/event/event-detail"
import { Button } from "@/components/ui/button/button"
import { Notice } from "@/components/ui/notice/notice"
import type { NoticeTone } from "@/components/ui/notice/notice"
import { Text } from "@/components/ui/text/text"
import { ApiResponseError } from "@/lib/api/api-response-error"
import { api } from "@/lib/api/client"
import { backToMap } from "@/lib/navigation/back-to-map"

const MAX_RETRIES = 3

/**
 * @description True when the API answered that the occurrence is unknown or hidden
 * @param error Error of the occurrence query
 */
const isNotFound = (error: Error) =>
    error instanceof ApiResponseError && error.status === HttpStatus.NotFound

interface ScreenNoticeProps {
    tone: NoticeTone
    message: string
    action?: { label: string; onPress: () => void }
}

const ScreenNotice = (props: ScreenNoticeProps) => {
    const insets = useSafeAreaInsets()
    const action = props.action

    return (
        <View
            className="flex-1 justify-center gap-4 bg-surface px-4"
            style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
        >
            <Notice tone={props.tone} lines={[props.message]} />
            {action !== undefined && (
                <Button
                    accessibilityLabel={action.label}
                    onPress={() => {
                        action.onPress()
                    }}
                >
                    <Text>{action.label}</Text>
                </Button>
            )}
        </View>
    )
}

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
        retry: (failureCount, error) => !isNotFound(error) && failureCount < MAX_RETRIES,
    })

    if (occurrence !== undefined) {
        return <EventDetail occurrence={occurrence} />
    }
    if (occurrenceError === null) {
        return <ScreenNotice tone="loading" message={t("Detail.Loading")} />
    }
    return isNotFound(occurrenceError) ? (
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
