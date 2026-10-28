import { HydrationBoundary } from "@tanstack/react-query"
import type { Metadata } from "next"

import { routes } from "@/framework/routes/routes"
import { getDynamicRoute } from "@/framework/routes/server/get-dynamic-route"
import { serverApi } from "@/lib/api/server/api"
import { prefetchQueries } from "@/lib/query/server/prefetch"
import { appBaseUrl } from "@/server/config/app-base-url"

import { VenueDetailView } from "./_page/client/venue-detail-view"
import { readVenue } from "./_page/server/read-venue"

const route = routes.venueDetail

// Reads the database, which no build stage can reach.
export const dynamic = "force-dynamic"

export const generateMetadata = async (
    props: PageProps<"/[lang]/venues/[venueId]">,
): Promise<Metadata> => {
    const { parameters, path } = await getDynamicRoute(route, props)
    const venue = await readVenue(parameters.venueId)
    const description = venue.description ?? venue.address
    const images =
        venue.coverPhotoUrl === null ? undefined : [{ url: venue.coverPhotoUrl }]

    // The venue name names a shared link, so it replaces the title of the route.
    return {
        metadataBase: appBaseUrl(),
        title: venue.name,
        description,
        openGraph: {
            type: "website",
            url: path,
            siteName: "Fomofobo",
            locale: "it_IT",
            title: venue.name,
            description,
            images,
        },
        twitter: {
            card: images === undefined ? "summary" : "summary_large_image",
            title: venue.name,
            description,
            images,
        },
    }
}

const Page = async (props: PageProps<"/[lang]/venues/[venueId]">) => {
    const { parameters, path } = await getDynamicRoute(route, props)
    const venue = await readVenue(parameters.venueId)

    const dehydratedState = await prefetchQueries(queryClient =>
        Promise.resolve(
            queryClient.setQueryData(
                serverApi.getPublicVenueQuery({
                    params: { venueId: venue.id },
                    query: {},
                }).queryKey,
                venue,
            ),
        ),
    )

    return (
        <HydrationBoundary state={dehydratedState}>
            <VenueDetailView route="venueDetail" url={new URL(path, appBaseUrl()).href} />
        </HydrationBoundary>
    )
}

export default Page
