"use client"

import { useLanguage } from "react-i18n/hooks"
import { useTranslation } from "react-i18next"

import { RouteLink } from "@/framework/routes/route-link/route-link"
import { routes } from "@/framework/routes/routes"

export const NotFoundView = () => {
    const { t } = useTranslation("shared")
    const language = useLanguage()

    return (
        <div className="flex grow flex-col items-center justify-center gap-4 p-4">
            <span className="tp-pixel-2xl">{t("NotFound.Title")}</span>
            <RouteLink
                route={routes.root}
                parameters={{ lang: language }}
                query={{}}
                className="tp-pixel-md text-fg underline"
            >
                {t("NotFound.BackHome")}
            </RouteLink>
        </div>
    )
}
