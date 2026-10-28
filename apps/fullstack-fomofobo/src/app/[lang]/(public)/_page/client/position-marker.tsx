"use client"

import {
    MARKER_CELL_PX,
    POSITION_CORE,
    POSITION_HALO,
    POSITION_HALO_FRAME_MS,
} from "domain/pixel-markers"
import { useTranslation } from "react-i18next"

import type { RouteClientComponentProps } from "@/framework/routes/routes"

import { PixelSprite } from "./pixel-sprite"

const CORE_PX = POSITION_CORE.cells * MARKER_CELL_PX

export const PositionMarker = (props: RouteClientComponentProps<"root">) => {
    const { t } = useTranslation("shared")

    return (
        <span
            role="img"
            aria-label={t("Map.Position")}
            className="relative block"
            style={{ width: CORE_PX, height: CORE_PX }}
        >
            <PixelSprite
                route={props.route}
                sprite={POSITION_HALO}
                frameMs={POSITION_HALO_FRAME_MS}
                className="text-position"
            />
            <svg
                aria-hidden={true}
                width={CORE_PX}
                height={CORE_PX}
                viewBox={`0 0 ${String(POSITION_CORE.cells)} ${String(POSITION_CORE.cells)}`}
                shapeRendering="crispEdges"
                className="absolute inset-0"
            >
                <path d={POSITION_CORE.fillPath} className="fill-position" />
                <path d={POSITION_CORE.ringPath} className="fill-line" />
            </svg>
        </span>
    )
}
