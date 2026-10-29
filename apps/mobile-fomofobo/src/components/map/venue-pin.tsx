import type { MarkerEmphasis } from "domain/event-clusters"
import type { CategoryIcon, PermanentVenueKind } from "models"
import { useTranslation } from "react-i18next"
import { Pressable } from "react-native"

import { PixelDisc } from "@/components/map/pixel-disc"
import { Badge } from "@/components/ui/badge/badge"
import { cn } from "@/lib/utils/class-names"

interface VenuePinProps {
    name: string
    kind: PermanentVenueKind
    icon: CategoryIcon
    emphasis: MarkerEmphasis
    onSelect: () => void
}

export const VenuePin = (props: VenuePinProps) => {
    const { t } = useTranslation("shared")

    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("Map.VenuePin", {
                name: props.name,
                kind: t(`VenueKind.${props.kind}`),
            })}
            onPress={props.onSelect}
            className={cn("items-center gap-0.5", {
                "opacity-35": props.emphasis === "dimmed",
            })}
        >
            <Badge tone="permanent" className="rounded-none">
                {t(`VenueKind.${props.kind}`)}
            </Badge>
            <PixelDisc
                kind="permanent"
                icon={props.icon}
                selected={props.emphasis === "selected"}
            />
        </Pressable>
    )
}
