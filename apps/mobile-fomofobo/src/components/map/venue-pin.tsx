import type { MarkerEmphasis } from "domain/event-clusters"
import type { CategoryIcon, PermanentVenueKind } from "models"
import { useTranslation } from "react-i18next"
import { View } from "react-native"

import { PixelDisc } from "@/components/map/pixel-disc"
import { Badge } from "@/components/ui/badge/badge"
import { PressBounce } from "@/components/ui/press-bounce/press-bounce"
import { cn } from "@/lib/utils/class-names"

// Widens the press of the disc to 44 pt across and below it, clear of the tag above
const PIN_HIT_SLOP = { top: 4, bottom: 13, left: 13, right: 13 }

const MARKER_BOUNCE = { scale: 0.9, shift: false }

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
        <View
            className={cn("items-center gap-0.5", {
                "opacity-35": props.emphasis === "dimmed",
            })}
        >
            <View pointerEvents="none">
                <Badge tone="permanent" className="rounded-none">
                    {t(`VenueKind.${props.kind}`)}
                </Badge>
            </View>
            {/* The disc alone opens the preview: the tag above it takes no press */}
            <PressBounce
                accessibilityRole="button"
                accessibilityLabel={t("Map.VenuePin", {
                    name: props.name,
                    kind: t(`VenueKind.${props.kind}`),
                })}
                onPress={props.onSelect}
                hitSlop={PIN_HIT_SLOP}
                bounce={MARKER_BOUNCE}
            >
                <PixelDisc
                    kind="permanent"
                    icon={props.icon}
                    selected={props.emphasis === "selected"}
                />
            </PressBounce>
        </View>
    )
}
