import type { OccurrenceDetail } from "models"
import { useTranslation } from "react-i18next"
import { ScrollView, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { IconButton } from "@/components/ui/icon-button/icon-button"
import { Text } from "@/components/ui/text/text"
import { backToMap } from "@/lib/navigation/back-to-map"

interface EventDetailProps {
    occurrence: OccurrenceDetail
}

export const EventDetail = (props: EventDetailProps) => {
    const { t } = useTranslation("shared")
    const insets = useSafeAreaInsets()

    return (
        <ScrollView
            className="flex-1 bg-surface"
            contentContainerClassName="gap-5 p-4"
            contentContainerStyle={{ paddingTop: insets.top + 16 }}
        >
            <View className="flex-row">
                <IconButton icon="back" label={t("Detail.Back")} onPress={backToMap} />
            </View>
            <Text variant="pixel-2xl" accessibilityRole="header" className="uppercase">
                {props.occurrence.title}
            </Text>
        </ScrollView>
    )
}
