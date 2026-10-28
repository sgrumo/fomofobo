"use client"

import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useLanguage } from "react-i18n/hooks"

import { VenueDetail } from "@/components/client/venue-detail/venue-detail"
import { useDynamicRoute } from "@/framework/routes/route-hooks/use-dynamic-route"
import { routes } from "@/framework/routes/routes"
import type { RouteClientComponentProps } from "@/framework/routes/routes"
import { api } from "@/lib/api/client-api"
import { useBackToMap } from "@/lib/hooks/use-back-to-map"
import { useNow } from "@/lib/hooks/use-now"

const CLOCK_TICK_MS = 60_000

interface VenueDetailViewProps extends RouteClientComponentProps<"venueDetail"> {
    url: string
}

export const VenueDetailView = (props: VenueDetailViewProps) => {
    const language = useLanguage()
    const router = useRouter()
    const goBack = useBackToMap()
    const now = useNow(CLOCK_TICK_MS)
    const { parameters } = useDynamicRoute(routes[props.route])
    // The page renders only after the server read the venue, so the cache holds it.
    const { data: venue } = useQuery(
        api.getPublicVenueQuery({ params: { venueId: parameters.venueId }, query: {} }),
    )

    return venue === undefined ? undefined : (
        <div className="mx-auto min-h-full max-w-xl p-4">
            <VenueDetail
                venue={venue}
                now={now}
                shareUrl={props.url}
                onBack={goBack}
                onOpenEvent={ref => {
                    router.push(
                        routes.eventDetail.path({
                            parameters: { lang: language, ...ref },
                            query: {},
                        }),
                    )
                }}
            />
        </div>
    )
}
