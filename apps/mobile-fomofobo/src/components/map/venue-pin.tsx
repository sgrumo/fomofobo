import type { MarkerEmphasis } from "domain/event-clusters"
import type { CategoryIcon, PermanentVenueKind } from "models"
import { useTranslation } from "react-i18next"
import { Pressable } from "react-native"

import { Badge } from "@/components/ui/badge/badge"
import { PixelCircle } from "@/components/ui/pixel-circle/pixel-circle"
import { PixelIcon } from "@/components/ui/pixel-icon/pixel-icon"
import { cn } from "@/lib/utils/class-names"

const PIN_ICON_SIZE = 20

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
            className={cn("items-center gap-1", {
                "opacity-35": props.emphasis === "dimmed",
            })}
        >
            <Badge tone="permanent" className="rounded-none">
                {t(`VenueKind.${props.kind}`)}
            </Badge>
            <PixelCircle
                size={36}
                fill="permanent"
                shadow={props.emphasis === "selected" ? "md" : undefined}
            >
                <PixelIcon name={props.icon} size={PIN_ICON_SIZE} centered={true} />
            </PixelCircle>
        </Pressable>
    )
}
