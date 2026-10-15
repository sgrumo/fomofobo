import { HydrationBoundary } from "@tanstack/react-query"
import type { Metadata } from "next"

import { routes } from "@/framework/routes/routes"
import { getDynamicRoute } from "@/framework/routes/server/get-dynamic-route"
import { serverApi } from "@/lib/api/server/api"
import { prefetchQueries } from "@/lib/query/server/prefetch"
import { requireSession } from "@/server/auth/require-session"

import { FilesFrame } from "./_page/server/files-frame"

const route = routes.files

// The prefetch below reads the database, which no build stage can reach.
export const dynamic = "force-dynamic"

export const generateMetadata = async (
    props: PageProps<"/[lang]/files">,
): Promise<Metadata> => {
    const { title } = await getDynamicRoute(route, props)
    return { title }
}

const Page = async (props: PageProps<"/[lang]/files">) => {
    const { parameters, path } = await getDynamicRoute(route, props)
    await requireSession(path)

    const dehydratedState = await prefetchQueries(queryClient =>
        Promise.allSettled([
            queryClient.query(serverApi.listFilesQuery({ params: {}, query: {} })),
        ]),
    )

    return (
        <HydrationBoundary state={dehydratedState}>
            <FilesFrame language={parameters.lang} />
        </HydrationBoundary>
    )
}

export default Page
