"use client"

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
    const liveEnd = `${String((props.liveCount / props.count) * 100)}%`
    const upcomingEnd = `${String(((props.liveCount + props.upcomingCount) / props.count) * 100)}%`
    const endedEnd = `${String(((props.count - props.permanentCount) / props.count) * 100)}%`

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
                    background: `conic-gradient(var(--color-live) 0 ${liveEnd}, var(--color-upcoming) ${liveEnd} ${upcomingEnd}, var(--color-ended) ${upcomingEnd} ${endedEnd}, var(--color-permanent) ${endedEnd} 100%)`,
                }}
            />
            <span className="bg-surface text-fg tp-pixel-lg relative flex size-9 items-center justify-center [clip-path:var(--pixel-circle-outer-36)]">
                {props.count}
            </span>
        </button>
    )
}
