import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { routes } from "@/framework/routes/routes"
import { getDynamicRoute } from "@/framework/routes/server/get-dynamic-route"
import { BACKOFFICE_HOME_PATH } from "@/lib/auth/return-path"

const route = routes.backoffice

export const dynamic = "force-dynamic"

export const generateMetadata = async (
    props: PageProps<"/backoffice">,
): Promise<Metadata> => {
    const { title } = await getDynamicRoute(route, props)
    return { title }
}

const Page = () => {
    redirect(BACKOFFICE_HOME_PATH)
}

export default Page
