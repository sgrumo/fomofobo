import type { MapPointKind } from "domain/event-clusters"
import { PIXEL_GLYPH_GRID, PIXEL_GLYPHS } from "domain/pixel-glyphs"
import { pixelIconPath } from "domain/pixel-icons"
import { EVENT_DISC, MARKER_CELL_PX, SELECTED_EVENT_DISC } from "domain/pixel-markers"
import type { CategoryIcon } from "models"
import { useId } from "react"
import type { ReactNode } from "react"
import { View } from "react-native"
import Svg, { ClipPath, Defs, Path } from "react-native-svg"

import { dashWedgesPath } from "@/lib/pixel/pixel-shapes"
import { THEME_COLORS } from "@/lib/theme/theme-tokens"

// Shadow cells of a selected disc, right and down
const SHADOW_CELLS = 2

const GLYPH_SIZE = PIXEL_GLYPH_GRID * MARKER_CELL_PX

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

    return (
        <View style={{ width: size, height: size }}>
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
                    {props.selected && (
                        <Path d={disc.shadowPath} fill={THEME_COLORS.line} />
                    )}
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
                style={{ left: (size - GLYPH_SIZE) / 2, top: (size - GLYPH_SIZE) / 2 }}
            >
                <Svg
                    width={GLYPH_SIZE}
                    height={GLYPH_SIZE}
                    viewBox={`0 0 ${String(PIXEL_GLYPH_GRID)} ${String(PIXEL_GLYPH_GRID)}`}
                >
                    <Path
                        d={pixelIconPath(PIXEL_GLYPHS[props.icon])}
                        fill={THEME_COLORS.line}
                    />
                </Svg>
            </View>
        </View>
    )
}
