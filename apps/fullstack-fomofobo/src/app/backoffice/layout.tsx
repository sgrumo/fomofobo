import "../globals.css"
import "@fontsource-variable/funnel-sans"
import "@fontsource/space-mono/400.css"
import "@fontsource/space-mono/700.css"
import type { Metadata } from "next"
import type { ReactNode } from "react"

import { RootDocument } from "@/components/server/root-document/root-document"
import { BACKOFFICE_LANGUAGE } from "@/lib/i18n/backoffice-language"

export const metadata: Metadata = {
    title: {
        default: "Fomofobo backoffice",
        template: "%s · Fomofobo backoffice",
    },
}

interface BackofficeRootLayoutProps {
    children?: ReactNode
}

const BackofficeRootLayout = (props: BackofficeRootLayoutProps) => (
    <RootDocument language={BACKOFFICE_LANGUAGE}>{props.children}</RootDocument>
)

export default BackofficeRootLayout
