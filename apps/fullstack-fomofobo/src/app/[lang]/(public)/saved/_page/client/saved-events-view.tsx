"use client"

import { useTranslation } from "react-i18next"

import type { RouteClientComponentProps } from "@/framework/routes/routes"

export const SavedEventsView = (_props: RouteClientComponentProps<"saved">) => {
    const { t } = useTranslation("shared")

    return (
        <section className="flex flex-col gap-4 p-4">
            <h1 className="tp-pixel-2xl">{t("PageTitle.Saved")}</h1>
        </section>
    )
}
