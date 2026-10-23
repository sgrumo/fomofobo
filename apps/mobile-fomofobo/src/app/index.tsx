import { DEFAULT_CITY } from "domain/platform"
import { Link } from "expo-router"
import { View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { EventMap } from "@/components/map/event-map"
import { useMapQuery } from "@/components/map/use-map-query"
import { Button } from "@/components/ui/button/button"
import { Text } from "@/components/ui/text/text"

const MapScreen = () => {
    const { query } = useMapQuery()

    const center =
        query.lat === undefined || query.lng === undefined
            ? DEFAULT_CITY.center
            : { latitude: query.lat, longitude: query.lng }

    return (
        <View className="flex-1 bg-map-ground">
            <EventMap center={center} />
            {__DEV__ && (
                <SafeAreaView
                    edges={["top"]}
                    className="absolute left-4 top-0"
                    pointerEvents="box-none"
                >
                    <Link href="/showcase" asChild={true}>
                        <Button
                            variant="secondary"
                            size="sm"
                            accessibilityLabel="Open the showcase"
                        >
                            <Text>Showcase</Text>
                        </Button>
                    </Link>
                </SafeAreaView>
            )}
        </View>
    )
}

export default MapScreen
