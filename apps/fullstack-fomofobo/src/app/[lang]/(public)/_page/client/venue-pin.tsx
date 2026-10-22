"use client"

import type { CategoryIcon, PermanentVenueKind } from "models"
import { useTranslation } from "react-i18next"
import { Badge } from "ui-components/badge"
import { PixelIcon } from "ui-components/pixel-icons"

import type { RouteClientComponentProps } from "@/framework/routes/routes"

interface VenuePinProps extends RouteClientComponentProps<"root"> {
    name: string
    kind: PermanentVenueKind
    icon: CategoryIcon
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
            className="flex cursor-pointer flex-col items-center gap-1"
        >
            <Badge tone="permanent" className="rounded-none">
                {t(`VenueKind.${props.kind}`)}
            </Badge>
            <span className="pixel-circle-36 drop-shadow-hard-sm text-fg relative flex size-9 items-center justify-center [--pixel-fill:var(--color-permanent)]">
                <PixelIcon name={props.icon} centered={true} className="size-5" />
            </span>
        </button>
    )
}
