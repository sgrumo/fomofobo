"use client"

import { clusterArcs } from "domain/event-clusters"
import { useTranslation } from "react-i18next"

import type { RouteClientComponentProps } from "@/framework/routes/routes"

interface EventClusterProps extends RouteClientComponentProps<"root"> {
    count: number
    liveCount: number
    upcomingCount: number
    endedCount: number
    permanentCount: number
    onExpand: () => void
}

export const EventCluster = (props: EventClusterProps) => {
    const { t } = useTranslation("shared")
    const ring = clusterArcs(props)
        .map(arc => `var(--color-${arc.kind}) ${String(arc.from)}% ${String(arc.to)}%`)
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
            className="pixel-circle-48 drop-shadow-hard-md relative flex size-12 cursor-pointer items-center justify-center"
        >
            <span
                aria-hidden={true}
                className="absolute inset-0 [clip-path:var(--pixel-circle-inner-48)]"
                style={{
                    background: `conic-gradient(${ring})`,
                }}
            />
            <span className="bg-surface text-fg tp-pixel-lg relative flex size-9 items-center justify-center [clip-path:var(--pixel-circle-outer-36)]">
                {props.count}
            </span>
        </button>
    )
}
