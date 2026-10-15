import type { ReactNode } from "react"

import { BaseLayout } from "@/components/client/base-layout/base-layout"
import { getSession } from "@/server/auth/session"

// Reads the session cookies, so no page of this group prerenders.
export const dynamic = "force-dynamic"

interface ProtectedLayoutProps {
    children?: ReactNode
}

/**
 * Frame of every page that needs a signed-in visitor.
 *
 * The guard is **not** here. Next hands a layout no pathname, so a redirect from here
 * would lose the page the visitor asked for. Every page of this group calls
 * `requireSession(routes.<page>.path(...))` instead, and the login round trip ends where it
 * began. This layout renders the session menu when a session exists, and the public frame
 * otherwise, while the page redirects.
 *
 * Neither is the security boundary. The API is: its Hono middleware verifies the token
 * of every call against the key set of the provider, and a page that forgot the guard
 * still reads nothing without one.
 */
const ProtectedLayout = async (props: ProtectedLayoutProps) => {
    const session = await getSession()

    return session === undefined ? (
        <BaseLayout variant="public">{props.children}</BaseLayout>
    ) : (
        <BaseLayout
            variant="protected"
            visitorName={session.name ?? session.email ?? session.subject}
        >
            {props.children}
        </BaseLayout>
    )
}

export default ProtectedLayout
