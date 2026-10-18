import "server-only"
import type { LanguageKey } from "i18n/i18n"

import { RouteLink } from "@/framework/routes/route-link/route-link"
import { routes } from "@/framework/routes/routes"
import { getTranslation } from "@/lib/i18n/server/translation"

interface OfflineViewProps {
    language: LanguageKey
}

export const OfflineView = (props: OfflineViewProps) => {
    const t = getTranslation(props.language)

    return (
        <section className="mx-auto flex max-w-xl flex-col items-start gap-4 p-4">
            <h1 className="tp-pixel-2xl uppercase">{t("Offline.Title")}</h1>
            <p className="tp-body-md text-fg-muted">{t("Offline.Description")}</p>
            <RouteLink
                route={routes.saved}
                parameters={{ lang: props.language }}
                query={{}}
                className="tp-pixel-md text-fg underline"
            >
                {t("Offline.OpenSaved")}
            </RouteLink>
            <RouteLink
                route={routes.root}
                parameters={{ lang: props.language }}
                query={{}}
                className="tp-pixel-md text-fg underline"
            >
                {t("Offline.BackHome")}
            </RouteLink>
        </section>
    )
}
