import { useQuery } from "@tanstack/react-query"
import { Stack, useLocalSearchParams } from "expo-router"
import { venueSchema } from "models"
import { useTranslation } from "react-i18next"
import { z } from "zod"

import { OfflineScreenNotice } from "@/components/screen-notice/offline-screen-notice"
import { ScreenNotice } from "@/components/screen-notice/screen-notice"
import { VenueDetail } from "@/components/venue/venue-detail"
import { isNotFoundError, retryUnlessNotFound } from "@/lib/api/api-response-error"
import { api } from "@/lib/api/client"
import { useOnline } from "@/lib/hooks/use-online"
import { backToMap } from "@/lib/navigation/back-to-map"

const venueParamsSchema = z.object({ venueId: venueSchema.shape.id })

interface PublicVenueScreenProps {
    venueId: string
}

const PublicVenueScreen = (props: PublicVenueScreenProps) => {
    const { t } = useTranslation("shared")
    const online = useOnline()
    const {
        data: venue,
        error: venueError,
        refetch,
    } = useQuery({
        ...api.getPublicVenueQuery({ params: { venueId: props.venueId }, query: {} }),
        retry: retryUnlessNotFound,
    })

    if (venue !== undefined) {
        return <VenueDetail venue={venue} />
    }
    if (!online) {
        return <OfflineScreenNotice message={t("Venue.Offline")} />
    }
    if (venueError === null) {
        return <ScreenNotice tone="loading" message={t("Venue.Loading")} />
    }
    return isNotFoundError(venueError) ? (
        <ScreenNotice
            tone="info"
            message={t("Venue.NotFound")}
            actions={[{ label: t("Detail.BackToMap"), onPress: backToMap }]}
        />
    ) : (
        <ScreenNotice
            tone="error"
            message={t("Venue.LoadFailed")}
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

const VenueScreen = () => {
    const { t } = useTranslation("shared")
    const venueParams = venueParamsSchema.safeParse(useLocalSearchParams())

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            {venueParams.success ? (
                <PublicVenueScreen venueId={venueParams.data.venueId} />
            ) : (
                <ScreenNotice
                    tone="info"
                    message={t("Venue.NotFound")}
                    actions={[{ label: t("Detail.BackToMap"), onPress: backToMap }]}
                />
            )}
        </>
    )
}

export default VenueScreen
