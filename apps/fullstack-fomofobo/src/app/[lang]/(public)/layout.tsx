import type { ReactNode } from "react"

import { BaseLayout } from "@/components/client/base-layout/base-layout"

interface PublicLayoutProps {
    children?: ReactNode
}

/**
 * Frame of every page open to anybody. Reads no request data, so a page of this group
 * keeps its own rendering mode.
 */
const PublicLayout = (props: PublicLayoutProps) => (
    <BaseLayout variant="public">{props.children}</BaseLayout>
)

export default PublicLayout
