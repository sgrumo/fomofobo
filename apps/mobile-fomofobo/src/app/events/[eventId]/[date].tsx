import { Stack } from "expo-router"
import { useTranslation } from "react-i18next"
import { View } from "react-native"

import { Notice } from "@/components/ui/notice/notice"

// Stub route: plan 023 builds the event screen here
const EventScreen = () => {
    const { t } = useTranslation("shared")

    return (
        <View className="flex-1 bg-surface p-4">
            <Stack.Screen options={{ title: t("Pending.Event") }} />
            <Notice tone="info" lines={[t("Pending.Soon")]} />
        </View>
    )
}

export default EventScreen
