"use client"

import { useTranslation } from "react-i18next"

import type { RouteClientComponentProps } from "@/framework/routes/routes"

export const MapScreen = (_props: RouteClientComponentProps<"root">) => {
    const { t } = useTranslation("shared")

    return (
        <section aria-label={t("Map.Label")} className="bg-map-ground absolute inset-0" />
    )
}
