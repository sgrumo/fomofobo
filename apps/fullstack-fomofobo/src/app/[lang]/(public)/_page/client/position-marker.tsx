"use client"

import { POSITION_BREATH_MS, POSITION_HALO } from "domain/pixel-shapes"
import { useTranslation } from "react-i18next"

import type { RouteClientComponentProps } from "@/framework/routes/routes"

export const PositionMarker = (_props: RouteClientComponentProps<"root">) => {
    const { t } = useTranslation("shared")

    return (
        <span role="img" aria-label={t("Map.Position")} className="relative block size-4">
            <svg
                aria-hidden={true}
                width={POSITION_HALO.size}
                height={POSITION_HALO.size}
                viewBox={POSITION_HALO.viewBox}
                shapeRendering="crispEdges"
                className="text-position pointer-events-none absolute top-1/2 left-1/2 -translate-1/2"
            >
                <path d={POSITION_HALO.innerPath} fill="currentColor" />
                <path
                    d={POSITION_HALO.outerPath}
                    fill="currentColor"
                    className="animate-halo-breath motion-reduce:hidden"
                    style={{ animationDuration: `${String(POSITION_BREATH_MS)}ms` }}
                />
            </svg>
            <span className="bg-position border-line absolute inset-0 rounded-full border-2" />
        </span>
    )
}
