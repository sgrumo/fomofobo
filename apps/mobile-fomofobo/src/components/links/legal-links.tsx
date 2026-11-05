import { privacyUrlOf, supportUrlOf } from "domain/legal-urls"
import { useLanguage } from "react-i18n/hooks"
import { useTranslation } from "react-i18next"
import { Linking, Pressable, View } from "react-native"

import { Text } from "@/components/ui/text/text"
import { env } from "@/lib/env"

// Grows the one-line links to the 44 pt target
const LINK_HIT_SLOP = { top: 14, bottom: 14 }

export const LegalLinks = () => {
    const { t } = useTranslation("shared")
    const language = useLanguage()
    const links = [
        { key: "Privacy", url: privacyUrlOf(env.apiUrl, language) },
        { key: "Support", url: supportUrlOf(env.apiUrl, language) },
    ] as const

    return (
        <View className="flex-row flex-wrap gap-4">
            {links.map(link => (
                <Pressable
                    key={link.key}
                    accessibilityRole="link"
                    accessibilityLabel={t(`Legal.${link.key}`)}
                    hitSlop={LINK_HIT_SLOP}
                    onPress={() => {
                        void Linking.openURL(link.url)
                    }}
                >
                    <Text variant="body-sm" className="text-fg-muted underline">
                        {t(`Legal.${link.key}`)}
                    </Text>
                </Pressable>
            ))}
        </View>
    )
}
