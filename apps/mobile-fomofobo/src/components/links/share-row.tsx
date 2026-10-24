import { shareUrlOf } from "domain/share-urls"
import type { ShareTarget } from "domain/share-urls"
import { useTranslation } from "react-i18next"
import { Linking, View } from "react-native"

import { IconButton } from "@/components/ui/icon-button/icon-button"
import { Text } from "@/components/ui/text/text"
import { useCopyLink } from "@/lib/hooks/use-copy-link"

const SHARE_TARGETS: readonly ShareTarget[] = ["whatsapp", "telegram", "facebook", "x"]

interface ShareRowProps {
    url: string
    text: string
}

export const ShareRow = (props: ShareRowProps) => {
    const { t } = useTranslation("shared")
    const copyLink = useCopyLink()

    return (
        <View className="gap-2">
            <Text
                variant="pixel-sm"
                accessibilityRole="header"
                className="uppercase text-fg-muted"
            >
                {t("Detail.ShareOn.Label")}
            </Text>
            <View className="flex-row flex-wrap gap-3">
                {SHARE_TARGETS.map(target => (
                    <IconButton
                        key={target}
                        icon={target}
                        label={t(`Detail.ShareOn.${target}`)}
                        onPress={() => {
                            void Linking.openURL(
                                shareUrlOf(target, { url: props.url, text: props.text }),
                            )
                        }}
                    />
                ))}
                <IconButton
                    icon="link"
                    label={t("Detail.ShareOn.Copy")}
                    onPress={() => {
                        void copyLink(props.url)
                    }}
                />
            </View>
        </View>
    )
}
