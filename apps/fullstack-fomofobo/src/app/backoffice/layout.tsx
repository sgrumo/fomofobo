import "../globals.css"
import "@fontsource-variable/funnel-sans"
import "@fontsource/space-mono/400.css"
import "@fontsource/space-mono/700.css"
import { defaultLanguage } from "i18n/i18n"
import type { Metadata } from "next"
import type { ReactNode } from "react"

import { RootDocument } from "@/components/server/root-document/root-document"

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
    <RootDocument language={defaultLanguage}>{props.children}</RootDocument>
)

export default BackofficeRootLayout
