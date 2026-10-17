import type { ReactNode } from "react"

import { BackofficeShell } from "@/components/client/backoffice-shell/backoffice-shell"
import { getSession } from "@/server/auth/session"

// Reads the session cookie, so no page of this group prerenders.
export const dynamic = "force-dynamic"

interface ProtectedLayoutProps {
    children?: ReactNode
}

// No guard here: a layout has no pathname, so each page calls `requireSession` with its own.
const ProtectedLayout = async (props: ProtectedLayoutProps) => {
    const session = await getSession()

    return session === undefined ? (
        props.children
    ) : (
        <BackofficeShell
            account={{ id: session.id, name: session.name, role: session.role }}
        >
            {props.children}
        </BackofficeShell>
    )
}

export default ProtectedLayout
