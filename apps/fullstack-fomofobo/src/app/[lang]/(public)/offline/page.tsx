import type { Metadata } from "next"

import { routes } from "@/framework/routes/routes"
import { getStaticRoute } from "@/framework/routes/server/get-static-route"

import { OfflineView } from "./_page/server/offline-view"

const route = routes.offline

export const generateStaticParams = route.generateStaticParams

export const generateMetadata = async (
    props: PageProps<"/[lang]/offline">,
): Promise<Metadata> => {
    const { title } = await getStaticRoute(route, props)
    return { title }
}

// The service worker precaches this page and serves it for a page it holds no copy of.
const Page = async (props: PageProps<"/[lang]/offline">) => {
    const { parameters } = await getStaticRoute(route, props)
    return <OfflineView language={parameters.lang} />
}

export default Page
