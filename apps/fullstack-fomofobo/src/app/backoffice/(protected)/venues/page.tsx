import type { Metadata } from "next"

import { routes } from "@/framework/routes/routes"
import { getDynamicRoute } from "@/framework/routes/server/get-dynamic-route"
import { requireSession } from "@/server/auth/require-session"

import { BackofficeVenuesView } from "./_page/client/backoffice-venues-view"

const route = routes.backofficeVenues

// Reads the session cookie, which no build stage holds.
export const dynamic = "force-dynamic"

export const generateMetadata = async (
    props: PageProps<"/backoffice/venues">,
): Promise<Metadata> => {
    const { title } = await getDynamicRoute(route, props)
    return { title }
}

const Page = async (props: PageProps<"/backoffice/venues">) => {
    const { path } = await getDynamicRoute(route, props)
    await requireSession(path)

    return <BackofficeVenuesView route="backofficeVenues" />
}

export default Page
