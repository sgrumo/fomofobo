import type { Metadata } from "next"

import { routes } from "@/framework/routes/routes"
import { getStaticRoute } from "@/framework/routes/server/get-static-route"

import { SupportView } from "./_page/server/support-view"

const route = routes.support

export const generateStaticParams = route.generateStaticParams

export const generateMetadata = async (
    props: PageProps<"/[lang]/support">,
): Promise<Metadata> => {
    const { title } = await getStaticRoute(route, props)
    return { title }
}

// The App Store and Google Play listings link this page as the support URL of the native app.
const Page = async (props: PageProps<"/[lang]/support">) => {
    const { parameters } = await getStaticRoute(route, props)
    return <SupportView language={parameters.lang} />
}

export default Page
