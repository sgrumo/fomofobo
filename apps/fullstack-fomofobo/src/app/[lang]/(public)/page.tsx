import { HydrationBoundary } from "@tanstack/react-query"
import { shareSummaryOf } from "domain/share-summary"
import type { Metadata } from "next"

import { routes } from "@/framework/routes/routes"
import { getDynamicRoute } from "@/framework/routes/server/get-dynamic-route"
import { serverApi } from "@/lib/api/server/api"
import { prefetchQueries } from "@/lib/query/server/prefetch"
import { appBaseUrl } from "@/server/config/app-base-url"

import { MapScreen } from "./_page/client/map-screen"
import { readDetail } from "./_page/server/read-detail"

const route = routes.root

// The prefetch below reads the database, which no build stage can reach.
export const dynamic = "force-dynamic"

export const generateMetadata = async (
    props: PageProps<"/[lang]">,
): Promise<Metadata> => {
    const { title, parameters, query, path } = await getDynamicRoute(route, props)
    const detail = await readDetail(query.event, query.occurrence, query.venue)
    if (detail === undefined) {
        return { title }
    }

    const card =
        detail.type === "occurrence"
            ? {
                  title: detail.occurrence.title,
                  description:
                      detail.occurrence.description ??
                      shareSummaryOf(detail.occurrence, parameters.lang),
                  images: [{ url: detail.occurrence.coverPhotoUrl }],
              }
            : {
                  title: detail.venue.name,
                  description: detail.venue.description ?? detail.venue.address,
                  images:
                      detail.venue.coverPhotoUrl === null
                          ? undefined
                          : [{ url: detail.venue.coverPhotoUrl }],
              }
    return {
        metadataBase: appBaseUrl(),
        title: card.title,
        description: card.description,
        openGraph: {
            type: "website",
            url: path,
            siteName: "Fomofobo",
            locale: "it_IT",
            ...card,
        },
        twitter: {
            card: card.images === undefined ? "summary" : "summary_large_image",
            ...card,
        },
    }
}

const Page = async (props: PageProps<"/[lang]">) => {
    const { query } = await getDynamicRoute(route, props)
    const detail = await readDetail(query.event, query.occurrence, query.venue)

    const dehydratedState = await prefetchQueries(queryClient =>
        Promise.allSettled([
            queryClient.query(serverApi.listCategoriesQuery({ params: {}, query: {} })),
            Promise.resolve(
                detail?.type === "occurrence"
                    ? queryClient.setQueryData(
                          serverApi.getOccurrenceQuery({
                              params: {
                                  eventId: detail.occurrence.eventId,
                                  date: detail.occurrence.date,
                              },
                              query: {},
                          }).queryKey,
                          detail.occurrence,
                      )
                    : undefined,
            ),
            Promise.resolve(
                detail?.type === "venue"
                    ? queryClient.setQueryData(
                          serverApi.getPublicVenueQuery({
                              params: { venueId: detail.venue.id },
                              query: {},
                          }).queryKey,
                          detail.venue,
                      )
                    : undefined,
            ),
        ]),
    )

    return (
        <HydrationBoundary state={dehydratedState}>
            <MapScreen route="root" baseUrl={appBaseUrl().origin} />
        </HydrationBoundary>
    )
}

export default Page
