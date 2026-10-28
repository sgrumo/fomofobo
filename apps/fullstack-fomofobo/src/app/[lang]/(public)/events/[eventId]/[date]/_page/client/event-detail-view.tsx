"use client"

import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useLanguage } from "react-i18n/hooks"

import { EventDetail } from "@/components/client/event-detail/event-detail"
import { useDynamicRoute } from "@/framework/routes/route-hooks/use-dynamic-route"
import { routes } from "@/framework/routes/routes"
import type { RouteClientComponentProps } from "@/framework/routes/routes"
import { api } from "@/lib/api/client-api"
import { useBackToMap } from "@/lib/hooks/use-back-to-map"
import { useNow } from "@/lib/hooks/use-now"

const CLOCK_TICK_MS = 60_000

interface EventDetailViewProps extends RouteClientComponentProps<"eventDetail"> {
    url: string
}

export const EventDetailView = (props: EventDetailViewProps) => {
    const language = useLanguage()
    const router = useRouter()
    const goBack = useBackToMap()
    const now = useNow(CLOCK_TICK_MS)
    const { parameters } = useDynamicRoute(routes[props.route])
    // The page renders only after the server read the occurrence, so the cache holds it.
    const { data: occurrence } = useQuery(
        api.getOccurrenceQuery({
            params: { eventId: parameters.eventId, date: parameters.date },
            query: {},
        }),
    )

    return occurrence === undefined ? undefined : (
        <div className="mx-auto min-h-full max-w-xl px-4 pt-4">
            <EventDetail
                occurrence={occurrence}
                now={now}
                shareUrl={props.url}
                onBack={goBack}
                onOpenVenue={venueId => {
                    router.push(
                        routes.venueDetail.path({
                            parameters: { lang: language, venueId },
                            query: {},
                        }),
                    )
                }}
            />
        </div>
    )
}
