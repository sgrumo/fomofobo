import type { GeoPoint } from "models"
import { useEffect, useState } from "react"

// `unknown` until the browser answers: the prompt may stay open
export type GeolocationState =
    | { status: "unknown" }
    | { status: "granted"; position: GeoPoint }
    | { status: "denied" }
    | { status: "unavailable" }

const POSITION_OPTIONS: PositionOptions = {
    enableHighAccuracy: false,
    maximumAge: 60_000,
}

// A browser with no answer leaves the request open with no timeout
const LOCATE_OPTIONS: PositionOptions = { ...POSITION_OPTIONS, timeout: 10_000 }

/**
 * @description Maps a position of the browser to the granted state
 * @param position Position the browser reported
 */
const grantedState = ({ coords }: GeolocationPosition): GeolocationState => ({
    status: "granted",
    position: { latitude: coords.latitude, longitude: coords.longitude },
})

/**
 * @description Maps an error of the browser to the denied or the unavailable state
 * @param error Error the browser reported
 */
const failedState = (error: GeolocationPositionError): GeolocationState =>
    error.code === error.PERMISSION_DENIED
        ? { status: "denied" }
        : { status: "unavailable" }

/**
 * @description Returns the state after an error: a lost fix keeps the last position
 * @param error Error the browser reported
 * @param previous State before the error
 */
const stateAfterError = (
    error: GeolocationPositionError,
    previous: GeolocationState,
): GeolocationState =>
    previous.status === "granted" && error.code !== error.PERMISSION_DENIED
        ? previous
        : failedState(error)

/**
 * @description Returns the position of the device, watched while the caller is mounted, and
 * a `locate` call that answers the watched position, else asks the browser for one
 * @remarks Reads the permission from the position calls alone: Safari reports `prompt` to
 * `navigator.permissions` until the page has called the Geolocation API
 */
export const useGeolocation = () => {
    const [state, setState] = useState<GeolocationState>({ status: "unknown" })
    const watching = state.status !== "denied" && state.status !== "unavailable"

    useEffect(() => {
        if (!watching || !("geolocation" in navigator)) {
            return undefined
        }

        const watchId = navigator.geolocation.watchPosition(
            position => {
                setState(grantedState(position))
            },
            error => {
                setState(previous => stateAfterError(error, previous))
            },
            POSITION_OPTIONS,
        )

        return () => {
            navigator.geolocation.clearWatch(watchId)
        }
    }, [watching])

    // A granted answer after a denial sets `watching` again, which restarts the watch.
    const locate = () =>
        new Promise<GeolocationState>(resolve => {
            // The watch keeps a granted position fresh
            if (state.status === "granted") {
                resolve(state)
                return
            }
            if (!("geolocation" in navigator)) {
                setState({ status: "unavailable" })
                resolve({ status: "unavailable" })
                return
            }

            navigator.geolocation.getCurrentPosition(
                position => {
                    const next = grantedState(position)
                    setState(next)
                    resolve(next)
                },
                error => {
                    setState(previous => stateAfterError(error, previous))
                    resolve(failedState(error))
                },
                LOCATE_OPTIONS,
            )
        })

    return { state, locate }
}
