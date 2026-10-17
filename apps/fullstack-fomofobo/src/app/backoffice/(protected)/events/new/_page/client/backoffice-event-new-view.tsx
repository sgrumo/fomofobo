"use client"

import { EventEditor } from "@/components/client/event-editor/event-editor"
import type { RouteClientComponentProps } from "@/framework/routes/routes"

export const BackofficeEventNewView = (
    _props: RouteClientComponentProps<"backofficeEventNew">,
) => <EventEditor />
