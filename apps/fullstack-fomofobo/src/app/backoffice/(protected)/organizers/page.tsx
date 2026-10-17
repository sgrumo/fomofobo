import type { Metadata } from "next"

import { routes } from "@/framework/routes/routes"
import { getDynamicRoute } from "@/framework/routes/server/get-dynamic-route"
import { requireAdminSession } from "@/server/auth/require-session"

import { BackofficeOrganizersView } from "./_page/client/backoffice-organizers-view"

const route = routes.backofficeOrganizers

// Reads the session cookie, which no build stage holds.
export const dynamic = "force-dynamic"

export const generateMetadata = async (
    props: PageProps<"/backoffice/organizers">,
): Promise<Metadata> => {
    const { title } = await getDynamicRoute(route, props)
    return { title }
}

const Page = async (props: PageProps<"/backoffice/organizers">) => {
    const { path } = await getDynamicRoute(route, props)
    await requireAdminSession(path)

    return <BackofficeOrganizersView route="backofficeOrganizers" />
}

export default Page
