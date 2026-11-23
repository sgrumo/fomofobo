import type { Metadata } from "next"

import { routes } from "@/framework/routes/routes"
import { getDynamicRoute } from "@/framework/routes/server/get-dynamic-route"

import { OauthLoginView } from "./_page/client/oauth-login-view"

const route = routes.backofficeOauthLogin

// The signed authorization query differs on every request.
export const dynamic = "force-dynamic"

export const generateMetadata = async (
    props: PageProps<"/backoffice/oauth-login">,
): Promise<Metadata> => {
    const { title } = await getDynamicRoute(route, props)
    return { title }
}

const Page = () => <OauthLoginView route="backofficeOauthLogin" />

export default Page
