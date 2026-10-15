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
            <span className="tp-h1">{t("NotFound.Title")}</span>
            <RouteLink
                route={routes.root}
                parameters={{ lang: language }}
                query={{}}
                className="tp-b1-medium text-primary-600 dark:text-primary-300 underline"
            >
                {t("NotFound.BackHome")}
            </RouteLink>
        </div>
    )
}
