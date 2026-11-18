import "@fontsource-variable/geist"
import "./_page/server/landing.css"
import type { Metadata } from "next"

import { routes } from "@/framework/routes/routes"
import { getStaticRoute } from "@/framework/routes/server/get-static-route"
import { getTranslation } from "@/lib/i18n/server/translation"
import { appStoreUrls } from "@/server/config/app-store-urls"

import { LandingView } from "./_page/server/landing-view"

const route = routes.root

export const generateStaticParams = route.generateStaticParams

export const generateMetadata = async (
    props: PageProps<"/[lang]">,
): Promise<Metadata> => {
    const { title, parameters } = await getStaticRoute(route, props)
    return { title, description: getTranslation(parameters.lang)("App.Description") }
}

// The build reads the store listings: a new listing needs a deploy, as every variable does.
const Page = async (props: PageProps<"/[lang]">) => {
    const { parameters } = await getStaticRoute(route, props)
    return <LandingView language={parameters.lang} storeUrls={appStoreUrls()} />
}

export default Page
