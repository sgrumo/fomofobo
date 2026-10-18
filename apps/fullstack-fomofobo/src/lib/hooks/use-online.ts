import { useSyncExternalStore } from "react"

/**
 * @description Subscribes the listener to the connectivity events of the browser
 * @param listener Callback run on each change
 */
const subscribe = (listener: () => void) => {
    globalThis.addEventListener("online", listener)
    globalThis.addEventListener("offline", listener)
    return () => {
        globalThis.removeEventListener("online", listener)
        globalThis.removeEventListener("offline", listener)
    }
}

/**
 * @description Returns true while the browser reports a network connection
 * @remarks Reads true on the server, during hydration and on a network with no upstream internet, so a failed request stays the proof
 */
export const useOnline = (): boolean =>
    useSyncExternalStore(
        subscribe,
        () => navigator.onLine,
        () => true,
    )
