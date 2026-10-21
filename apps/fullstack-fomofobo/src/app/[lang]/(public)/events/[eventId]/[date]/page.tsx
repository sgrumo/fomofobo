import { HydrationBoundary } from "@tanstack/react-query"
import type { Metadata } from "next"

import { routes } from "@/framework/routes/routes"
import { getDynamicRoute } from "@/framework/routes/server/get-dynamic-route"
import { serverApi } from "@/lib/api/server/api"
import { prefetchQueries } from "@/lib/query/server/prefetch"
import { shareSummaryOf } from "@/lib/share/share-summary"
import { appBaseUrl } from "@/server/config/app-base-url"

import { EventDetailView } from "./_page/client/event-detail-view"
import { readOccurrence } from "./_page/server/read-occurrence"

const route = routes.eventDetail

// Reads the database, which no build stage can reach.
export const dynamic = "force-dynamic"

export const generateMetadata = async (
    props: PageProps<"/[lang]/events/[eventId]/[date]">,
): Promise<Metadata> => {
    const { parameters, path } = await getDynamicRoute(route, props)
    const occurrence = await readOccurrence(parameters.eventId, parameters.date)
    const description =
        occurrence.description ?? shareSummaryOf(occurrence, parameters.lang)
    const images =
        occurrence.coverPhotoUrl === null
            ? undefined
            : [{ url: occurrence.coverPhotoUrl }]

    // The event title names a shared link, so it replaces the title of the route.
    return {
        metadataBase: appBaseUrl(),
        title: occurrence.title,
        description,
        openGraph: {
            type: "website",
            url: path,
            siteName: "Fomofobo",
            locale: "it_IT",
            title: occurrence.title,
            description,
            images,
        },
        twitter: {
            card: images === undefined ? "summary" : "summary_large_image",
            title: occurrence.title,
            description,
            images,
        },
    }
}

const Page = async (props: PageProps<"/[lang]/events/[eventId]/[date]">) => {
    const { parameters, path } = await getDynamicRoute(route, props)
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
            <EventDetailView route="eventDetail" url={new URL(path, appBaseUrl()).href} />
        </HydrationBoundary>
    )
}

export default Page
