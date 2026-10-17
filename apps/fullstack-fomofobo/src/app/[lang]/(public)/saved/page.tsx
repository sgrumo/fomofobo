import type { Metadata } from "next"

import { routes } from "@/framework/routes/routes"
import { getStaticRoute } from "@/framework/routes/server/get-static-route"

import { SavedEventsView } from "./_page/client/saved-events-view"

const route = routes.saved

export const generateStaticParams = route.generateStaticParams

export const generateMetadata = async (
    props: PageProps<"/[lang]/saved">,
): Promise<Metadata> => {
    const { title } = await getStaticRoute(route, props)
    return { title }
}

const Page = () => <SavedEventsView route="saved" />

export default Page
