"use client"

import { clusterArcs } from "domain/event-clusters"
import type { MarkerEmphasis } from "domain/event-clusters"
import { CLUSTER_SHAPE, MARKER_CELL_PX } from "domain/pixel-markers"
import { cn } from "frontend-shared/styles"
import { useTranslation } from "react-i18next"

import type { RouteClientComponentProps } from "@/framework/routes/routes"

const CLUSTER_PX = CLUSTER_SHAPE.cells * MARKER_CELL_PX

// The band between the two ink rings, where the ring of the shares shows
const BAND_MASK = `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${String(CLUSTER_SHAPE.cells)} ${String(CLUSTER_SHAPE.cells)}" shape-rendering="crispEdges"><path d="${CLUSTER_SHAPE.bandPath}"/></svg>`,
)}")`

interface EventClusterProps extends RouteClientComponentProps<"root"> {
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
    const ring = clusterArcs(props)
        .map(
            arc =>
                `var(--color-${arc.kind === "ended" ? "surface" : arc.kind}) ${String(arc.from)}% ${String(arc.to)}%`,
        )
        .join(", ")

    return (
        <button
            type="button"
            aria-label={t("Map.Cluster", {
                count: props.count,
                live: props.liveCount,
                upcoming: props.upcomingCount,
                ended: props.endedCount,
                permanent: props.permanentCount,
            })}
            onClick={props.onExpand}
            className={cn(
                "relative flex cursor-pointer items-center justify-center transition-opacity",
                { "opacity-35": props.emphasis === "dimmed" },
            )}
            style={{ width: CLUSTER_PX, height: CLUSTER_PX }}
        >
            <span
                aria-hidden={true}
                className="absolute inset-0"
                style={{
                    background: `conic-gradient(${ring})`,
                    maskImage: BAND_MASK,
                    maskSize: "100% 100%",
                }}
            />
            <svg
                aria-hidden={true}
                width={CLUSTER_PX}
                height={CLUSTER_PX}
                viewBox={`0 0 ${String(CLUSTER_SHAPE.cells)} ${String(CLUSTER_SHAPE.cells)}`}
                shapeRendering="crispEdges"
                className="absolute inset-0"
            >
                <path d={CLUSTER_SHAPE.fillPath} className="fill-surface" />
                <path d={CLUSTER_SHAPE.inkPath} className="fill-line" />
            </svg>
            <span className="text-fg tp-pixel-lg relative">{props.count}</span>
        </button>
    )
}
