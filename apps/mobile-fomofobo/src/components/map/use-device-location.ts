import type { LocationStatus } from "domain/map-center"
import {
    Accuracy,
    getCurrentPositionAsync,
    getForegroundPermissionsAsync,
    hasServicesEnabledAsync,
    PermissionStatus,
    requestForegroundPermissionsAsync,
    watchPositionAsync,
} from "expo-location"
import type { LocationObject, LocationSubscription } from "expo-location"
import type { GeoPoint } from "models"
import { useEffect, useState } from "react"
import { AppState, Linking } from "react-native"
import type { StrictExclude } from "shared/types"

type DeviceLocation =
    | { status: StrictExclude<LocationStatus, "granted"> }
    | { status: "granted"; position: GeoPoint }

const POSITION_OPTIONS = { accuracy: Accuracy.Balanced, distanceInterval: 25 }

/**
 * @description Maps a fix of the device to the granted state
 * @param location Fix the device reported
 */
const grantedState = ({ coords }: LocationObject): DeviceLocation => ({
    status: "granted",
    position: { latitude: coords.latitude, longitude: coords.longitude },
})

/**
 * @description Returns the state after a failed fix: a lost fix keeps the last position
 * @param previous State before the failure
 */
const stateAfterFailure = (previous: DeviceLocation): DeviceLocation =>
    previous.status === "granted" ? previous : { status: "unavailable" }

/**
 * @description Returns the state that the permission and the location services allow, before any fix
 * @param permission Foreground permission status
 */
const readinessOf = async (permission: PermissionStatus): Promise<DeviceLocation> => {
    if (permission !== PermissionStatus.GRANTED) {
        return { status: "denied" }
    }
    return (await hasServicesEnabledAsync())
        ? { status: "unknown" }
        : { status: "unavailable" }
}

/**
 * @description Returns the position of the device, watched while the caller is mounted, and a
 * `locate` call that asks for it again
 * @remarks Opens the app settings from `locate` when the system no longer shows the prompt
 */
export const useDeviceLocation = () => {
    const [state, setState] = useState<DeviceLocation>({ status: "unknown" })
    const watching = state.status === "unknown" || state.status === "granted"
    const denied = state.status === "denied"

    useEffect(() => {
        if (!watching) {
            return undefined
        }

        const watch: { subscription?: LocationSubscription; stopped: boolean } = {
            stopped: false,
        }
        const start = async () => {
            const { status } = await requestForegroundPermissionsAsync()
            const readiness = await readinessOf(status)
            if (readiness.status !== "unknown") {
                setState(readiness)
                return
            }
            const subscription = await watchPositionAsync(
                POSITION_OPTIONS,
                location => {
                    setState(grantedState(location))
                },
                () => {
                    setState(stateAfterFailure)
                },
            )
            if (watch.stopped) {
                subscription.remove()
                return
            }
            watch.subscription = subscription
        }
        start().catch(() => {
            setState(stateAfterFailure)
        })

        return () => {
            watch.stopped = true
            watch.subscription?.remove()
        }
    }, [watching])

    // A permission granted in the system settings applies when the app comes back.
    useEffect(() => {
        if (!denied) {
            return undefined
        }
        const recheck = async () => {
            const { status } = await getForegroundPermissionsAsync()
            if (status === PermissionStatus.GRANTED) {
                setState({ status: "unknown" })
            }
        }
        const subscription = AppState.addEventListener("change", appState => {
            if (appState === "active") {
                void recheck()
            }
        })
        return () => {
            subscription.remove()
        }
    }, [denied])

    const locate = async (): Promise<DeviceLocation> => {
        const permission = await requestForegroundPermissionsAsync()
        if (permission.status !== PermissionStatus.GRANTED && !permission.canAskAgain) {
            void Linking.openSettings()
        }
        const readiness = await readinessOf(permission.status)
        if (readiness.status !== "unknown") {
            setState(readiness)
            return readiness
        }
        try {
            const next = grantedState(await getCurrentPositionAsync(POSITION_OPTIONS))
            setState(next)
            return next
        } catch {
            setState(stateAfterFailure)
            return { status: "unavailable" }
        }
    }

    return { state, locate }
}
