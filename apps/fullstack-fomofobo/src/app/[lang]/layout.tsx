import "../globals.css"
import "@fontsource-variable/funnel-sans"
import "@fontsource/space-mono/400.css"
import "@fontsource/space-mono/700.css"
import { languageKeySchema } from "i18n/i18n"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { DevQuadrant } from "@/components/client/dev-quadrant/dev-quadrant"
import { GlobalProviders } from "@/components/client/global-providers/global-providers"
import { HydrationMarker } from "@/components/client/hydration-marker/hydration-marker"
import { I18nProvider } from "@/components/client/i18n-provider/i18n-provider"
import { getResources } from "@/lib/i18n/server/resources"

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

    return (
        <html lang={language.data}>
            <body>
                <HydrationMarker />
                <div id="root">
                    <I18nProvider
                        language={language.data}
                        resources={getResources(language.data)}
                    >
                        <GlobalProviders>
                            {props.children}
                            {process.env.NODE_ENV === "development" && <DevQuadrant />}
                        </GlobalProviders>
                    </I18nProvider>
                </div>
            </body>
        </html>
    )
}

export default RootLayout
