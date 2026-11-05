"use client"

import { useLanguage } from "react-i18n/hooks"
import { useTranslation } from "react-i18next"

import { RouteLink } from "@/framework/routes/route-link/route-link"
import { routes } from "@/framework/routes/routes"

export const LegalLinks = () => {
    const { t } = useTranslation("shared")
    const language = useLanguage()

    return (
        <nav className="tp-body-sm text-fg-muted flex flex-wrap gap-4 [&>a]:underline">
            <RouteLink route={routes.privacy} parameters={{ lang: language }} query={{}}>
                {t("Legal.Privacy")}
            </RouteLink>
            <RouteLink route={routes.support} parameters={{ lang: language }} query={{}}>
                {t("Legal.Support")}
            </RouteLink>
        </nav>
    )
}
