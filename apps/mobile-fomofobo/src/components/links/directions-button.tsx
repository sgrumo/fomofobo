import type { BottomSheetModal } from "@gorhom/bottom-sheet"
import { directionsUrl } from "domain/directions-url"
import type { MapsProvider } from "domain/directions-url"
import type { GeoPoint } from "models"
import { useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { Linking, Platform, View } from "react-native"

import { BottomSheet } from "@/components/ui/bottom-sheet/bottom-sheet"
import { Button } from "@/components/ui/button/button"
import { Text } from "@/components/ui/text/text"
import { installedMapsProvidersOf } from "@/lib/geo/maps-provider"

interface DirectionsButtonProps {
    coordinates: GeoPoint
    className?: string
}

export const DirectionsButton = (props: DirectionsButtonProps) => {
    const { t } = useTranslation("shared")
    const sheetRef = useRef<BottomSheetModal>(null)
    const [providers, setProviders] = useState<readonly MapsProvider[]>([])

    const openIn = (provider: MapsProvider) => {
        void Linking.openURL(directionsUrl(props.coordinates, provider))
    }
    // One maps app opens at once, more open the choice
    const chooseProvider = async () => {
        const installed = await installedMapsProvidersOf(Platform.OS, url =>
            Linking.canOpenURL(url),
        )
        const [only] = installed
        if (installed.length === 1 && only !== undefined) {
            openIn(only)
            return
        }
        setProviders(installed)
        sheetRef.current?.present()
    }

    return (
        <>
            <Button
                icon="directions"
                size="sm"
                accessibilityRole="button"
                accessibilityLabel={t("Detail.Directions")}
                className={props.className}
                onPress={() => {
                    void chooseProvider()
                }}
            >
                <Text>{t("Detail.Directions")}</Text>
            </Button>
            <BottomSheet ref={sheetRef} title={t("Directions.Title")}>
                {/* Square corners, as the 8-bit controls of the map */}
                <View className="gap-3">
                    {providers.map(provider => (
                        <Button
                            key={provider}
                            variant="secondary"
                            accessibilityRole="link"
                            accessibilityLabel={t(`Directions.App.${provider}`)}
                            className="rounded-none"
                            onPress={() => {
                                sheetRef.current?.dismiss()
                                openIn(provider)
                            }}
                        >
                            <Text>{t(`Directions.App.${provider}`)}</Text>
                        </Button>
                    ))}
                </View>
            </BottomSheet>
        </>
    )
}
