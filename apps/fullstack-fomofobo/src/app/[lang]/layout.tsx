import "../globals.css"
import "@fontsource-variable/funnel-sans"
import "@fontsource/space-mono/400.css"
import "@fontsource/space-mono/700.css"
import { languageKeySchema } from "i18n/i18n"
import type { Metadata, Viewport } from "next"
import { notFound } from "next/navigation"

import { RootDocument } from "@/components/server/root-document/root-document"
import { MAP_GROUND_COLOR } from "@/lib/pwa/pwa-colors"

export const metadata: Metadata = {
    title: {
        default: "Fomofobo",
        template: "%s · Fomofobo",
    },
    applicationName: "Fomofobo",
    appleWebApp: {
        capable: true,
        title: "Fomofobo",
        // The map screen has no safe-area insets, so the iOS status bar keeps its own band
        statusBarStyle: "default",
    },
}

export const viewport: Viewport = {
    themeColor: MAP_GROUND_COLOR,
}

const RootLayout = async (props: LayoutProps<"/[lang]">) => {
    const { lang } = await props.params
    const language = languageKeySchema.safeParse(lang)
    if (!language.success) {
        notFound()
    }

    return <RootDocument language={language.data}>{props.children}</RootDocument>
}

export default RootLayout
