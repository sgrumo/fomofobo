import "server-only"
import type { LanguageKey } from "i18n/i18n"

import { RouteLink } from "@/framework/routes/route-link/route-link"
import { routes } from "@/framework/routes/routes"
import { getTranslation } from "@/lib/i18n/server/translation"

interface RootNavigationProps {
    language: LanguageKey
}

export const RootNavigation = (props: RootNavigationProps) => {
    const t = getTranslation(props.language)
    const parameters = { lang: props.language }

    return (
        <nav className="flex flex-col gap-4 p-4">
            <RouteLink
                route={routes.devShowcase}
                parameters={parameters}
                query={{}}
                className="tp-body-md"
            >
                {t("Routes.Dev")}
            </RouteLink>
        </nav>
    )
}
