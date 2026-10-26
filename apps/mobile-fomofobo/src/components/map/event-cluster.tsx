import { clusterArcs } from "domain/event-clusters"
import { PIXEL_CIRCLE_PROFILES } from "domain/pixel-shapes"
import { useId } from "react"
import { useTranslation } from "react-i18next"
import { Pressable, View } from "react-native"
import Svg, { ClipPath, Defs, G, Path } from "react-native-svg"

import { Text } from "@/components/ui/text/text"
import {
    innerProfile,
    PIXEL_RING_WIDTH,
    steppedPath,
    wedgePath,
} from "@/lib/pixel/pixel-shapes"
import { HARD_SHADOW_OFFSETS, THEME_COLORS } from "@/lib/theme/theme-tokens"

const CLUSTER_SIZE = 48
const CORE_SIZE = 36
const SHADOW_OFFSET = HARD_SHADOW_OFFSETS.md
const DEGREES_PER_PERCENT = 3.6

interface EventClusterProps {
    count: number
    liveCount: number
    upcomingCount: number
    endedCount: number
    permanentCount: number
    onExpand: () => void
}

export const EventCluster = (props: EventClusterProps) => {
    const { t } = useTranslation("shared")
    const id = useId()
    const profile = PIXEL_CIRCLE_PROFILES[CLUSTER_SIZE]
    const ring = 2 * PIXEL_RING_WIDTH

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
            className="h-12 w-12 items-center justify-center"
        >
            <View className="absolute left-0 top-0" pointerEvents="none">
                <Svg
                    width={CLUSTER_SIZE + SHADOW_OFFSET}
                    height={CLUSTER_SIZE + SHADOW_OFFSET}
                >
                    <Defs>
                        <ClipPath id={`${id}-ring`}>
                            <Path
                                d={steppedPath(
                                    CLUSTER_SIZE - ring,
                                    CLUSTER_SIZE - ring,
                                    innerProfile(profile),
                                    PIXEL_RING_WIDTH,
                                )}
                            />
                        </ClipPath>
                    </Defs>
                    <Path
                        fill={THEME_COLORS.line}
                        d={steppedPath(
                            CLUSTER_SIZE,
                            CLUSTER_SIZE,
                            profile,
                            SHADOW_OFFSET,
                        )}
                    />
                    <Path
                        fill={THEME_COLORS.line}
                        d={steppedPath(CLUSTER_SIZE, CLUSTER_SIZE, profile)}
                    />
                    <G clipPath={`url(#${id}-ring)`}>
                        {clusterArcs(props)
                            .filter(arc => arc.to > arc.from)
                            .map(arc => (
                                <Path
                                    key={arc.kind}
                                    fill={THEME_COLORS[arc.kind]}
                                    d={wedgePath(
                                        CLUSTER_SIZE,
                                        CLUSTER_SIZE,
                                        arc.from * DEGREES_PER_PERCENT,
                                        arc.to * DEGREES_PER_PERCENT,
                                    )}
                                />
                            ))}
                    </G>
                    <Path
                        fill={THEME_COLORS.surface}
                        d={steppedPath(
                            CORE_SIZE,
                            CORE_SIZE,
                            PIXEL_CIRCLE_PROFILES[CORE_SIZE],
                            (CLUSTER_SIZE - CORE_SIZE) / 2,
                        )}
                    />
                </Svg>
            </View>
            <Text variant="pixel-lg" maxFontSizeMultiplier={1.5}>
                {String(props.count)}
            </Text>
        </Pressable>
    )
}
