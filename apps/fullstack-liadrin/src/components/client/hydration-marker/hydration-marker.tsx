"use client"

import { useEffect } from "react"

// Sets `data-hydrated` on the root `<html>` once React has hydrated the page. The E2E
// suite waits for it before it acts: an event fired on the server HTML before
// hydration reaches no handler and is lost.
export const HydrationMarker = () => {
    useEffect(() => {
        document.documentElement.dataset.hydrated = ""
    }, [])

    return undefined
}
