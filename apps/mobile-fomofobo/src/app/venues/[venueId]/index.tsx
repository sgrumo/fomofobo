import { Stack } from "expo-router"
import { useTranslation } from "react-i18next"
import { View } from "react-native"

import { Notice } from "@/components/ui/notice/notice"

// Stub route: plan 036 builds the venue screen here
const VenueScreen = () => {
    const { t } = useTranslation("shared")

    return (
        <View className="flex-1 bg-surface p-4">
            <Stack.Screen options={{ title: t("Pending.Venue") }} />
            <Notice tone="info" lines={[t("Pending.Soon")]} />
        </View>
    )
}

export default VenueScreen
