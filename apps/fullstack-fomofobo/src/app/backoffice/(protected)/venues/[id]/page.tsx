import type { Metadata } from "next"

import { routes } from "@/framework/routes/routes"
import { getDynamicRoute } from "@/framework/routes/server/get-dynamic-route"
import { requireSession } from "@/server/auth/require-session"

import { BackofficeVenueView } from "./_page/client/backoffice-venue-view"

const route = routes.backofficeVenue

// Reads the session cookie, which no build stage holds.
export const dynamic = "force-dynamic"

export const generateMetadata = async (
    props: PageProps<"/backoffice/venues/[id]">,
): Promise<Metadata> => {
    const { title } = await getDynamicRoute(route, props)
    return { title }
}

const Page = async (props: PageProps<"/backoffice/venues/[id]">) => {
    const { path } = await getDynamicRoute(route, props)
    await requireSession(path)

    return <BackofficeVenueView route="backofficeVenue" />
}

export default Page
