import "../globals.css"
import "@fontsource-variable/funnel-sans"
import "@fontsource/space-mono/400.css"
import "@fontsource/space-mono/700.css"
import { languageKeySchema } from "i18n/i18n"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { RootDocument } from "@/components/server/root-document/root-document"

export const metadata: Metadata = {
    title: {
        default: "Fomofobo",
        template: "%s · Fomofobo",
    },
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
