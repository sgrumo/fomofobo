"use client"

import { useQuery } from "@tanstack/react-query"

import { useDynamicRoute } from "@/framework/routes/route-hooks/use-dynamic-route"
import { routes } from "@/framework/routes/routes"
import type { RouteClientComponentProps } from "@/framework/routes/routes"
import { api } from "@/lib/api/client-api"

export const EventDetailView = (props: RouteClientComponentProps<"eventDetail">) => {
    const { parameters } = useDynamicRoute(routes[props.route])
    const { data: occurrence } = useQuery(
        api.getOccurrenceQuery({
            params: { eventId: parameters.eventId, date: parameters.date },
            query: {},
        }),
    )

    return (
        <article className="flex flex-col gap-4 p-4">
            <h1 className="tp-pixel-2xl">{occurrence?.title}</h1>
        </article>
    )
}
