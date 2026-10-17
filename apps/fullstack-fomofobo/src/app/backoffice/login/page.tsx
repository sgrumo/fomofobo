import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { routes } from "@/framework/routes/routes"
import { getDynamicRoute } from "@/framework/routes/server/get-dynamic-route"
import { sanitizeReturnPath } from "@/lib/auth/return-path"
import { getSession } from "@/server/auth/session"

import { LoginView } from "./_page/client/login-view"

const route = routes.backofficeLogin

// Reads the session cookie, which no build stage holds.
export const dynamic = "force-dynamic"

export const generateMetadata = async (
    props: PageProps<"/backoffice/login">,
): Promise<Metadata> => {
    const { title } = await getDynamicRoute(route, props)
    return { title }
}

const Page = async (props: PageProps<"/backoffice/login">) => {
    const { query } = await getDynamicRoute(route, props)
    if ((await getSession()) !== undefined) {
        redirect(sanitizeReturnPath(query.returnTo))
    }

    return <LoginView route="backofficeLogin" />
}

export default Page
