import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { routes } from "@/framework/routes/routes"
import { getDynamicRoute } from "@/framework/routes/server/get-dynamic-route"
import { devPagesEnabled } from "@/server/config/dev-pages"

import { DevShowcaseView } from "./_page/client/dev-showcase-view"

const route = routes.devShowcase

// Reads the environment, so it never prerenders: a build-time render would bake the
// answer of the build machine into a page the deployed instance must refuse.
export const dynamic = "force-dynamic"

export const generateMetadata = async (
    props: PageProps<"/[lang]/dev/showcase">,
): Promise<Metadata> => {
    const { title } = await getDynamicRoute(route, props)
    return { title }
}

// Internal tooling. A deployed environment answers 404, so the showcase and the
// sample props never reach the public.
const Page = () => {
    if (!devPagesEnabled()) {
        notFound()
    }

    return <DevShowcaseView route="devShowcase" />
}

export default Page
