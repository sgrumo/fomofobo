import type { Metadata } from "next"

import { routes } from "@/framework/routes/routes"
import { getStaticRoute } from "@/framework/routes/server/get-static-route"

import { PrivacyView } from "./_page/server/privacy-view"

const route = routes.privacy

export const generateStaticParams = route.generateStaticParams

export const generateMetadata = async (
    props: PageProps<"/[lang]/privacy">,
): Promise<Metadata> => {
    const { title } = await getStaticRoute(route, props)
    return { title }
}

// The App Store and Google Play listings link this page as the privacy policy of the native app.
const Page = async (props: PageProps<"/[lang]/privacy">) => {
    const { parameters } = await getStaticRoute(route, props)
    return <PrivacyView language={parameters.lang} />
}

export default Page
