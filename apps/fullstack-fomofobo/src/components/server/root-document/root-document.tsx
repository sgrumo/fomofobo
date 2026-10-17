import "server-only"
import type { LanguageKey } from "i18n/i18n"
import type { ReactNode } from "react"

import { DevQuadrant } from "@/components/client/dev-quadrant/dev-quadrant"
import { GlobalProviders } from "@/components/client/global-providers/global-providers"
import { HydrationMarker } from "@/components/client/hydration-marker/hydration-marker"
import { I18nProvider } from "@/components/client/i18n-provider/i18n-provider"
import { getResources } from "@/lib/i18n/server/resources"

interface RootDocumentProps {
    language: LanguageKey
    children?: ReactNode
}

// Holds no global styles or fonts: each root layout imports them.
export const RootDocument = (props: RootDocumentProps) => (
    <html lang={props.language}>
        <body>
            <HydrationMarker />
            <div id="root">
                <I18nProvider
                    language={props.language}
                    resources={getResources(props.language)}
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
