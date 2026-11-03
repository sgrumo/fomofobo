import { Info } from "lucide-react-native"
import { useTranslation } from "react-i18next"
import { Linking, Pressable, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { Text } from "@/components/ui/text/text"
import { THEME_COLORS } from "@/lib/theme/theme-tokens"

const SOURCES = [
    { key: "OpenFreeMap", url: "https://openfreemap.org" },
    { key: "OpenMapTiles", url: "https://www.openmaptiles.org/" },
    { key: "OpenStreetMap", url: "https://www.openstreetmap.org/copyright" },
] as const

// Grows the one-line links to the 44 pt target
const LINK_HIT_SLOP = { top: 14, bottom: 14 }

const TOGGLE_ICON_SIZE = 16

// Grows the icon to the 44 pt target
const TOGGLE_HIT_SLOP = { top: 14, bottom: 14, left: 14, right: 14 }

interface MapAttributionProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

// Paper on the map green is under AA, so the line sits on an ink strip
export const MapAttribution = (props: MapAttributionProps) => {
    const { t } = useTranslation("shared")
    const insets = useSafeAreaInsets()

    return (
        <View
            className="absolute right-4 flex-row items-center gap-1 bg-surface-inverse px-1"
            style={{ bottom: insets.bottom }}
        >
            {props.open
                ? SOURCES.map(source => (
                      <Pressable
                          key={source.key}
                          accessibilityRole="link"
                          accessibilityLabel={t(`Map.Attribution.${source.key}`)}
                          hitSlop={LINK_HIT_SLOP}
                          onPress={() => {
                              void Linking.openURL(source.url)
                          }}
                      >
                          <Text variant="body-sm" className="text-fg-inverse underline">
                              {t(`Map.Attribution.${source.key}`)}
                          </Text>
                      </Pressable>
                  ))
                : undefined}
            <Pressable
                accessibilityRole="button"
                accessibilityLabel={t("Map.Credits")}
                accessibilityState={{ expanded: props.open }}
                hitSlop={TOGGLE_HIT_SLOP}
                onPress={() => {
                    props.onOpenChange(!props.open)
                }}
            >
                <Info size={TOGGLE_ICON_SIZE} color={THEME_COLORS["fg-inverse"]} />
            </Pressable>
        </View>
    )
}
