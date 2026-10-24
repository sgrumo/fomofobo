import { directionsUrl } from "domain/directions-url"
import type { GeoPoint } from "models"
import { useTranslation } from "react-i18next"
import { Linking, Platform } from "react-native"

import { Button } from "@/components/ui/button/button"
import { Text } from "@/components/ui/text/text"
import { mapsProviderOf } from "@/lib/geo/maps-provider"

interface DirectionsButtonProps {
    coordinates: GeoPoint
    className?: string
}

export const DirectionsButton = (props: DirectionsButtonProps) => {
    const { t } = useTranslation("shared")

    return (
        <Button
            icon="directions"
            size="sm"
            accessibilityRole="link"
            accessibilityLabel={t("Detail.Directions")}
            className={props.className}
            onPress={() => {
                void Linking.openURL(
                    directionsUrl(props.coordinates, mapsProviderOf(Platform.OS)),
                )
            }}
        >
            <Text>{t("Detail.Directions")}</Text>
        </Button>
    )
}
