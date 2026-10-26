import { useCallback, useSyncExternalStore } from "react"

/**
 * @description Returns true while the media query matches
 * @param query CSS media query
 * @remarks Reads false on the server and during hydration
 */
export const useMediaQuery = (query: string): boolean => {
    const subscribe = useCallback(
        (listener: () => void) => {
            const list = globalThis.matchMedia(query)
            list.addEventListener("change", listener)
            return () => {
                list.removeEventListener("change", listener)
            }
        },
        [query],
    )
    return useSyncExternalStore(
        subscribe,
        () => globalThis.matchMedia(query).matches,
        () => false,
    )
}
