import { noop } from "es-toolkit"
import { useSyncExternalStore } from "react"

const subscribe = () => noop

/**
 * @description True when React renders on the client outside hydration
 * @remarks Hydration reads the server snapshot, then one re-render applies the client one
 */
export const useIsClientRender = (): boolean =>
    useSyncExternalStore(
        subscribe,
        () => true,
        () => false,
    )
