import type { Metadata } from "next"

import { routes } from "@/framework/routes/routes"
import { getStaticRoute } from "@/framework/routes/server/get-static-route"

import { RootNavigation } from "./_page/server/root-navigation"

const route = routes.root

export const generateStaticParams = route.generateStaticParams

export const generateMetadata = async (
    props: PageProps<"/[lang]">,
): Promise<Metadata> => {
    const { title } = await getStaticRoute(route, props)
    return { title }
}

const Page = async (props: PageProps<"/[lang]">) => {
    const { parameters } = await getStaticRoute(route, props)
    return <RootNavigation language={parameters.lang} />
}

export default Page
