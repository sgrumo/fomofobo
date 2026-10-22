import type { Metadata } from "next"

import { routes } from "@/framework/routes/routes"
import { getDynamicRoute } from "@/framework/routes/server/get-dynamic-route"
import { requireAdminSession } from "@/server/auth/require-session"

import { BackofficeSettingsView } from "./_page/client/backoffice-settings-view"

const route = routes.backofficeSettings

// Reads the session cookie, which no build stage holds.
export const dynamic = "force-dynamic"

export const generateMetadata = async (
    props: PageProps<"/backoffice/settings">,
): Promise<Metadata> => {
    const { title } = await getDynamicRoute(route, props)
    return { title }
}

const Page = async (props: PageProps<"/backoffice/settings">) => {
    const { path } = await getDynamicRoute(route, props)
    await requireAdminSession(path)

    return <BackofficeSettingsView route="backofficeSettings" />
}

export default Page
