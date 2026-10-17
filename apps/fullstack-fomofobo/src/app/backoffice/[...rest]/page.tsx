import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { routes } from "@/framework/routes/routes"
import { getDynamicRoute } from "@/framework/routes/server/get-dynamic-route"

const route = routes.backofficeNotFound

export const dynamic = "force-dynamic"

export const generateMetadata = async (
    props: PageProps<"/backoffice/[...rest]">,
): Promise<Metadata> => {
    const { title } = await getDynamicRoute(route, props)
    return { title }
}

const Page = () => {
    notFound()
}

export default Page
