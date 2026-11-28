import "maplibre-gl/dist/maplibre-gl.css"
import type { ReactNode } from "react"

import { ActiveDeviceCheckIn } from "@/components/client/active-device-check-in/active-device-check-in"
import { InAppHistoryTracker } from "@/components/client/in-app-history-tracker/in-app-history-tracker"
import { SaveSync } from "@/components/client/save-sync/save-sync"
import { ServiceWorkerRegistrar } from "@/components/client/service-worker-registrar/service-worker-registrar"

interface PublicLayoutProps {
    children?: ReactNode
}

/**
 * Frame of every page open to anybody. Reads no request data, so a page of this group
 * keeps its own rendering mode. The one place that registers the service worker, sends
 * the queued save changes and the check-in of the day: the backoffice layout never does.
 */
const PublicLayout = (props: PublicLayoutProps) => (
    <main className="bg-surface text-fg relative h-dvh w-dvw overflow-auto">
        <InAppHistoryTracker />
        <ServiceWorkerRegistrar />
        <SaveSync />
        <ActiveDeviceCheckIn />
        {props.children}
    </main>
)

export default PublicLayout
