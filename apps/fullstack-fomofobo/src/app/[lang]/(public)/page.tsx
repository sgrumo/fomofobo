import { HydrationBoundary } from "@tanstack/react-query"
import type { Metadata } from "next"

import { routes } from "@/framework/routes/routes"
import { getDynamicRoute } from "@/framework/routes/server/get-dynamic-route"
import { serverApi } from "@/lib/api/server/api"
import { prefetchQueries } from "@/lib/query/server/prefetch"

import { MapScreen } from "./_page/client/map-screen"

const route = routes.root

// The prefetch below reads the database, which no build stage can reach.
export const dynamic = "force-dynamic"

export const generateMetadata = async (
    props: PageProps<"/[lang]">,
): Promise<Metadata> => {
    const { title } = await getDynamicRoute(route, props)
    return { title }
}

const Page = async () => {
    const dehydratedState = await prefetchQueries(queryClient =>
        Promise.allSettled([
            queryClient.query(serverApi.listCategoriesQuery({ params: {}, query: {} })),
        ]),
    )

    return (
        <HydrationBoundary state={dehydratedState}>
            <MapScreen route="root" />
        </HydrationBoundary>
    )
}

export default Page
