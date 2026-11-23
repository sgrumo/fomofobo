import type { Metadata } from "next"

import { routes } from "@/framework/routes/routes"
import { getDynamicRoute } from "@/framework/routes/server/get-dynamic-route"
import { requireAdminSession } from "@/server/auth/require-session"

import { OauthConsentView } from "./_page/client/oauth-consent-view"

const route = routes.backofficeOauthConsent

// Reads the session cookie, which no build stage holds.
export const dynamic = "force-dynamic"

export const generateMetadata = async (
    props: PageProps<"/backoffice/oauth-consent">,
): Promise<Metadata> => {
    const { title } = await getDynamicRoute(route, props)
    return { title }
}

const Page = async (props: PageProps<"/backoffice/oauth-consent">) => {
    const { path } = await getDynamicRoute(route, props)
    await requireAdminSession(path)

    return <OauthConsentView route="backofficeOauthConsent" />
}

export default Page
