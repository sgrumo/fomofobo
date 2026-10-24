import NetInfo from "@react-native-community/netinfo"
import { onlineManager } from "@tanstack/react-query"

/**
 * @remarks TanStack Query reads the online state of a browser, which React Native has no notion
 * of. This maps the connection that NetInfo reports onto it, so an offline query pauses and keeps
 * its cached data, and a paused query runs when the connection comes back
 */
onlineManager.setEventListener(setOnline =>
    NetInfo.addEventListener(state => {
        setOnline(state.isConnected !== false)
    }),
)
