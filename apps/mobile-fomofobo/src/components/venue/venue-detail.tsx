import type { PublicVenue } from "models"
import { useTranslation } from "react-i18next"
import { ScrollView, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { Badge } from "@/components/ui/badge/badge"
import { IconButton } from "@/components/ui/icon-button/icon-button"
import { Text } from "@/components/ui/text/text"
import { backToMap } from "@/lib/navigation/back-to-map"

interface VenueDetailProps {
    venue: PublicVenue
}

export const VenueDetail = (props: VenueDetailProps) => {
    const { t } = useTranslation("shared")
    const insets = useSafeAreaInsets()
    const venue = props.venue

    return (
        <View className="flex-1 bg-surface">
            <ScrollView
                className="flex-1"
                contentContainerClassName="gap-5 p-4"
                contentContainerStyle={{
                    paddingTop: insets.top + 8,
                    paddingBottom: insets.bottom + 16,
                }}
            >
                <View className="flex-row">
                    <IconButton
                        icon="back"
                        label={t("Detail.Back")}
                        onPress={backToMap}
                    />
                </View>
                <View className="gap-2">
                    {venue.kind !== "regular" && (
                        <Badge tone="permanent" className="self-start">
                            {t(`VenueKind.${venue.kind}`)}
                        </Badge>
                    )}
                    <Text
                        variant="pixel-2xl"
                        accessibilityRole="header"
                        className="uppercase"
                    >
                        {venue.name}
                    </Text>
                    <Text variant="body-md" className="text-fg-muted">
                        {venue.address}
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
