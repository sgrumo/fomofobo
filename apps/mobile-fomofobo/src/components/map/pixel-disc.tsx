import type { MapPointKind } from "domain/event-clusters"
import {
    EVENT_DISC,
    MARKER_CELL_PX,
    PIN_ICONS,
    SELECTED_EVENT_DISC,
} from "domain/pixel-markers"
import type { CategoryIcon } from "models"
import { useId } from "react"
import type { ReactNode } from "react"
import { View } from "react-native"
import Svg, { ClipPath, Defs, Path } from "react-native-svg"

import { dashWedgesPath } from "@/lib/pixel/pixel-shapes"
import { THEME_COLORS } from "@/lib/theme/theme-tokens"

// Shadow cells of a selected disc, right and down
const SHADOW_CELLS = 2

// Half the growth of a selected disc. The kit icons sit in `EVENT_DISC`, so a selected disc moves
// them by it, and hangs it below the pin so that its center stays on the point of the pin.
const SELECTED_HALF_GROWTH =
    ((SELECTED_EVENT_DISC.cells - EVENT_DISC.cells) * MARKER_CELL_PX) / 2

interface PixelDiscProps {
    kind: MapPointKind
    icon: CategoryIcon
    selected: boolean
    // Drawn behind the disc, centered on it
    behind?: ReactNode
}

export const PixelDisc = (props: PixelDiscProps) => {
    const id = useId()
    const disc = props.selected ? SELECTED_EVENT_DISC : EVENT_DISC
    const size = disc.cells * MARKER_CELL_PX
    const drawn = props.selected ? disc.cells + SHADOW_CELLS : disc.cells
    const dashed = props.kind === "ended"
    const icon = PIN_ICONS[props.icon]
    const iconShift = props.selected ? SELECTED_HALF_GROWTH : 0

    return (
        <View style={{ width: size, height: size, marginBottom: -iconShift }}>
            {props.behind}
            <View pointerEvents="none" className="absolute left-0 top-0">
                <Svg
                    width={drawn * MARKER_CELL_PX}
                    height={drawn * MARKER_CELL_PX}
                    viewBox={`0 0 ${String(drawn)} ${String(drawn)}`}
                >
                    {dashed && (
                        <Defs>
                            <ClipPath id={`${id}-dash`}>
                                <Path d={dashWedgesPath(disc.cells, disc.cells)} />
                            </ClipPath>
                        </Defs>
                    )}
                    <Path d={disc.shadowPath} fill={THEME_COLORS.line} />
                    <Path d={disc.fillPath} fill={THEME_COLORS[props.kind]} />
                    <Path
                        d={disc.ringPath}
                        fill={THEME_COLORS.line}
                        clipPath={dashed ? `url(#${id}-dash)` : undefined}
                    />
                </Svg>
            </View>
            <View
                pointerEvents="none"
                className="absolute"
                style={{ left: icon.left + iconShift, top: icon.top + iconShift }}
            >
                <Svg
                    width={icon.cells * icon.cellPx}
                    height={icon.cells * icon.cellPx}
                    viewBox={`0 0 ${String(icon.cells)} ${String(icon.cells)}`}
                >
                    <Path d={icon.path} fill={THEME_COLORS.line} />
                </Svg>
            </View>
        </View>
    )
}
