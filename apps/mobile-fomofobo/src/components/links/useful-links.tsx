import type { PixelIconName } from "domain/pixel-icons"
import type { UsefulLink, UsefulLinkType } from "domain/useful-links"
import { useTranslation } from "react-i18next"
import { Linking, View } from "react-native"

import { Button } from "@/components/ui/button/button"
import { Text } from "@/components/ui/text/text"

const LINK_ICONS = {
    website: "link",
    instagram: "instagram",
    facebook: "facebook",
} as const satisfies Record<UsefulLinkType, PixelIconName>

interface UsefulLinksProps {
    links: UsefulLink[]
}

export const UsefulLinks = (props: UsefulLinksProps) => {
    const { t } = useTranslation("shared")

    return (
        props.links.length > 0 && (
            <View className="gap-2">
                <Text
                    variant="pixel-sm"
                    accessibilityRole="header"
                    className="uppercase text-fg-muted"
                >
                    {t("Detail.UsefulLinks")}
                </Text>
                <View className="flex-row flex-wrap gap-3">
                    {props.links.map(link => (
                        <Button
                            key={link.type}
                            variant="secondary"
                            size="sm"
                            icon={LINK_ICONS[link.type]}
                            accessibilityRole="link"
                            accessibilityLabel={t(`Detail.Links.${link.type}`)}
                            className="min-h-11 grow"
                            onPress={() => {
                                void Linking.openURL(link.url)
                            }}
                        >
                            <Text>{t(`Detail.Links.${link.type}`)}</Text>
                        </Button>
                    ))}
                </View>
            </View>
        )
    )
}
