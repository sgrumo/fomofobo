import "maplibre-gl/dist/maplibre-gl.css"
import type { ReactNode } from "react"

import { InAppHistoryTracker } from "@/components/client/in-app-history-tracker/in-app-history-tracker"

interface PublicLayoutProps {
    children?: ReactNode
}

/**
 * Frame of every page open to anybody. Reads no request data, so a page of this group
 * keeps its own rendering mode.
 */
const PublicLayout = (props: PublicLayoutProps) => (
    <main className="bg-surface text-fg relative h-dvh w-dvw overflow-auto">
        <InAppHistoryTracker />
        {props.children}
    </main>
)

export default PublicLayout
