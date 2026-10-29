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
        <div
            className={cn("flex flex-col items-center gap-0.5 transition-opacity", {
                "opacity-35": props.emphasis === "dimmed",
            })}
        >
            <Badge tone="permanent" className="rounded-none">
                {t(`VenueKind.${props.kind}`)}
            </Badge>
            {/* The disc alone opens the preview: the tag above it takes no press */}
            <button
                type="button"
                aria-label={t("Map.VenuePin", {
                    name: props.name,
                    kind: t(`VenueKind.${props.kind}`),
                })}
                onClick={props.onSelect}
                className="cursor-pointer transition-[scale] duration-150 ease-[cubic-bezier(0.34,1.56,0.64,1)] active:scale-90 motion-reduce:active:scale-100"
            >
                <PixelDisc
                    route={props.route}
                    kind="permanent"
                    icon={props.icon}
                    selected={props.emphasis === "selected"}
                />
            </button>
        </div>
    )
}
