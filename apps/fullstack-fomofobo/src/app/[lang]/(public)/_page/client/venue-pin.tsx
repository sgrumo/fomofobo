"use client"

import type { MarkerEmphasis } from "domain/event-clusters"
import { cn } from "frontend-shared/styles"
import type { CategoryIcon, PermanentVenueKind } from "models"
import { useTranslation } from "react-i18next"
import { Badge } from "ui-components/badge"

import type { RouteClientComponentProps } from "@/framework/routes/routes"

import { PixelDisc } from "./pixel-disc"

interface VenuePinProps extends RouteClientComponentProps<"root"> {
    name: string
    kind: PermanentVenueKind
    icon: CategoryIcon
    emphasis: MarkerEmphasis
    onSelect: () => void
}

export const VenuePin = (props: VenuePinProps) => {
    const { t } = useTranslation("shared")

    return (
        <button
            type="button"
            aria-label={t("Map.VenuePin", {
                name: props.name,
                kind: t(`VenueKind.${props.kind}`),
            })}
            onClick={props.onSelect}
            className={cn(
                "flex cursor-pointer flex-col items-center gap-1 transition-opacity",
                { "opacity-35": props.emphasis === "dimmed" },
            )}
        >
            <Badge tone="permanent" className="rounded-none">
                {t(`VenueKind.${props.kind}`)}
            </Badge>
            <PixelDisc
                route={props.route}
                kind="permanent"
                icon={props.icon}
                selected={props.emphasis === "selected"}
            />
        </button>
    )
}
