import { clusterArcs } from "domain/event-clusters"
import type { MarkerEmphasis } from "domain/event-clusters"
import { CLUSTER_SHAPE, MARKER_CELL_PX } from "domain/pixel-markers"
import { useId } from "react"
import { useTranslation } from "react-i18next"
import { Pressable, View } from "react-native"
import Svg, { ClipPath, Defs, G, Path } from "react-native-svg"

import { Text } from "@/components/ui/text/text"
import { wedgePath } from "@/lib/pixel/pixel-shapes"
import { THEME_COLORS } from "@/lib/theme/theme-tokens"
import { cn } from "@/lib/utils/class-names"

const CLUSTER_SIZE = CLUSTER_SHAPE.cells * MARKER_CELL_PX
const DEGREES_PER_PERCENT = 3.6

interface EventClusterProps {
    count: number
    liveCount: number
    upcomingCount: number
    endedCount: number
    permanentCount: number
    emphasis: MarkerEmphasis
    onExpand: () => void
}

export const EventCluster = (props: EventClusterProps) => {
    const { t } = useTranslation("shared")
    const id = useId()

    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("Map.Cluster", {
                count: props.count,
                live: props.liveCount,
                upcoming: props.upcomingCount,
                ended: props.endedCount,
                permanent: props.permanentCount,
            })}
            onPress={props.onExpand}
            className={cn("items-center justify-center", {
                "opacity-35": props.emphasis === "dimmed",
            })}
            style={{ width: CLUSTER_SIZE, height: CLUSTER_SIZE }}
        >
            <View className="absolute left-0 top-0" pointerEvents="none">
                <Svg
                    width={CLUSTER_SIZE}
                    height={CLUSTER_SIZE}
                    viewBox={`0 0 ${String(CLUSTER_SHAPE.cells)} ${String(CLUSTER_SHAPE.cells)}`}
                >
                    <Defs>
                        <ClipPath id={`${id}-band`}>
                            <Path d={CLUSTER_SHAPE.bandPath} />
                        </ClipPath>
                    </Defs>
                    <Path d={CLUSTER_SHAPE.fillPath} fill={THEME_COLORS.surface} />
                    <Path d={CLUSTER_SHAPE.inkPath} fill={THEME_COLORS.line} />
                    <G clipPath={`url(#${id}-band)`}>
                        {clusterArcs(props)
                            .filter(arc => arc.to > arc.from)
                            .map(arc => (
                                <Path
                                    key={arc.kind}
                                    // The ended share stays the color of the core
                                    fill={
                                        THEME_COLORS[
                                            arc.kind === "ended" ? "surface" : arc.kind
                                        ]
                                    }
                                    d={wedgePath(
                                        CLUSTER_SHAPE.cells,
                                        CLUSTER_SHAPE.cells,
                                        arc.from * DEGREES_PER_PERCENT,
                                        arc.to * DEGREES_PER_PERCENT,
                                    )}
                                />
                            ))}
                    </G>
                </Svg>
            </View>
            <Text variant="pixel-lg" maxFontSizeMultiplier={1.5}>
                {String(props.count)}
            </Text>
        </Pressable>
    )
}
