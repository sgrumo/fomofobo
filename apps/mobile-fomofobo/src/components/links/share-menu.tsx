import type { PixelIconName } from "domain/pixel-icons"
import { shareUrlOf } from "domain/share-urls"
import type { ShareTarget } from "domain/share-urls"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Linking, View } from "react-native"
import Svg, { Path } from "react-native-svg"

import { IconButton } from "@/components/ui/icon-button/icon-button"
import { iconButtonSizes } from "@/components/ui/icon-button/icon-button.styles"
import { PixelPanel } from "@/components/ui/pixel-panel/pixel-panel"
import { Text } from "@/components/ui/text/text"
import { useCopyLink } from "@/lib/hooks/use-copy-link"
import { THEME_COLORS } from "@/lib/theme/theme-tokens"

const SHARE_TARGETS: readonly ShareTarget[] = ["whatsapp", "telegram", "facebook"]

// The caret over the panel: 7 by 4 cells of 2 pt, the bottom row over the top border of the panel
const CARET_CELL = 2
const CARET_INK_PATH = "M3 0h1v1h-1zM2 1h3v1h-3zM1 2h5v1h-5zM0 3h7v1h-7z"
const CARET_FILL_PATH = "M3 1h1v1h-1zM2 2h3v1h-3zM1 3h5v1h-5z"

// Puts the tip of the caret under the middle of the share button
const CARET_RIGHT = iconButtonSizes.md.circle / 2 - (7 * CARET_CELL) / 2

interface ShareOptionProps {
    icon: PixelIconName
    name: string
    label: string
    onPress: () => void
}

const ShareOption = (props: ShareOptionProps) => (
    <View className="w-16 items-center gap-1.5">
        <IconButton
            icon={props.icon}
            label={props.label}
            size="lg"
            onPress={props.onPress}
        />
        {/* The button carries the label */}
        <Text
            variant="pixel-sm"
            numberOfLines={1}
            adjustsFontSizeToFit={true}
            accessibilityElementsHidden={true}
            importantForAccessibility="no"
        >
            {props.name}
        </Text>
    </View>
)

interface ShareMenuProps {
    url: string
    text: string
}

export const ShareMenu = (props: ShareMenuProps) => {
    const { t } = useTranslation("shared")
    const copyLink = useCopyLink()
    const [open, setOpen] = useState(false)

    return (
        <View className="z-10">
            <IconButton
                icon="share"
                label={t("Detail.ShareOn.Open")}
                tone={open ? "inverse" : "surface"}
                expanded={open}
                onPress={() => {
                    setOpen(!open)
                }}
            />
            {open && (
                <PixelPanel shadow="md" className="absolute right-0 top-full mt-3">
                    <View className="flex-row gap-1 px-2 py-3">
                        {SHARE_TARGETS.map(target => (
                            <ShareOption
                                key={target}
                                icon={target}
                                name={t(`Detail.ShareOn.Names.${target}`)}
                                label={t(`Detail.ShareOn.${target}`)}
                                onPress={() => {
                                    setOpen(false)
                                    void Linking.openURL(
                                        shareUrlOf(target, {
                                            url: props.url,
                                            text: props.text,
                                        }),
                                    )
                                }}
                            />
                        ))}
                        <ShareOption
                            icon="link"
                            name={t("Detail.ShareOn.Names.link")}
                            label={t("Detail.ShareOn.Copy")}
                            onPress={() => {
                                setOpen(false)
                                void copyLink(props.url)
                            }}
                        />
                    </View>
                    <View
                        pointerEvents="none"
                        className="absolute"
                        style={{ top: -3 * CARET_CELL, right: CARET_RIGHT }}
                    >
                        <Svg
                            width={7 * CARET_CELL}
                            height={4 * CARET_CELL}
                            viewBox="0 0 7 4"
                        >
                            <Path d={CARET_INK_PATH} fill={THEME_COLORS.line} />
                            <Path d={CARET_FILL_PATH} fill={THEME_COLORS.surface} />
                        </Svg>
                    </View>
                </PixelPanel>
            )}
        </View>
    )
}
