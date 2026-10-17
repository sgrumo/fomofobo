import type { Metadata } from "next"

import { routes } from "@/framework/routes/routes"
import { getDynamicRoute } from "@/framework/routes/server/get-dynamic-route"
import { requireSession } from "@/server/auth/require-session"

import { BackofficeEventNewView } from "./_page/client/backoffice-event-new-view"

const route = routes.backofficeEventNew

// Reads the session cookie, which no build stage holds.
export const dynamic = "force-dynamic"

export const generateMetadata = async (
    props: PageProps<"/backoffice/events/new">,
): Promise<Metadata> => {
    const { title } = await getDynamicRoute(route, props)
    return { title }
}

const Page = async (props: PageProps<"/backoffice/events/new">) => {
    const { path } = await getDynamicRoute(route, props)
    await requireSession(path)

    return <BackofficeEventNewView route="backofficeEventNew" />
}

export default Page
