import { HydrationBoundary } from "@tanstack/react-query"
import type { Metadata } from "next"

import { routes } from "@/framework/routes/routes"
import { getDynamicRoute } from "@/framework/routes/server/get-dynamic-route"
import { serverApi } from "@/lib/api/server/api"
import { prefetchQueries } from "@/lib/query/server/prefetch"

import { EventDetailView } from "./_page/client/event-detail-view"
import { readOccurrence } from "./_page/server/read-occurrence"

const route = routes.eventDetail

// Reads the database, which no build stage can reach.
export const dynamic = "force-dynamic"

export const generateMetadata = async (
    props: PageProps<"/[lang]/events/[eventId]/[date]">,
): Promise<Metadata> => {
    const { parameters } = await getDynamicRoute(route, props)
    const occurrence = await readOccurrence(parameters.eventId, parameters.date)

    // The event title names a shared link, so it replaces the title of the route.
    return {
        title: occurrence.title,
        description: occurrence.description ?? undefined,
        openGraph: {
            title: occurrence.title,
            images:
                occurrence.coverPhotoUrl === null
                    ? undefined
                    : [{ url: occurrence.coverPhotoUrl }],
        },
    }
}

const Page = async (props: PageProps<"/[lang]/events/[eventId]/[date]">) => {
    const { parameters } = await getDynamicRoute(route, props)
    const occurrence = await readOccurrence(parameters.eventId, parameters.date)

    const dehydratedState = await prefetchQueries(queryClient =>
        Promise.resolve(
            queryClient.setQueryData(
                serverApi.getOccurrenceQuery({
                    params: { eventId: parameters.eventId, date: parameters.date },
                    query: {},
                }).queryKey,
                occurrence,
            ),
        ),
    )

    return (
        <HydrationBoundary state={dehydratedState}>
            <EventDetailView route="eventDetail" />
        </HydrationBoundary>
    )
}

export default Page
