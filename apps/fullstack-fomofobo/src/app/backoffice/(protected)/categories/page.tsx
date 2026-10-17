import type { Metadata } from "next"

import { routes } from "@/framework/routes/routes"
import { getDynamicRoute } from "@/framework/routes/server/get-dynamic-route"
import { requireAdminSession } from "@/server/auth/require-session"

import { BackofficeCategoriesView } from "./_page/client/backoffice-categories-view"

const route = routes.backofficeCategories

// Reads the session cookie, which no build stage holds.
export const dynamic = "force-dynamic"

export const generateMetadata = async (
    props: PageProps<"/backoffice/categories">,
): Promise<Metadata> => {
    const { title } = await getDynamicRoute(route, props)
    return { title }
}

const Page = async (props: PageProps<"/backoffice/categories">) => {
    const { path } = await getDynamicRoute(route, props)
    await requireAdminSession(path)

    return <BackofficeCategoriesView route="backofficeCategories" />
}

export default Page
