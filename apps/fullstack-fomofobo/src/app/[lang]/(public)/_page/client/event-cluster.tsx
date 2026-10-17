"use client"

import { useTranslation } from "react-i18next"

import type { RouteClientComponentProps } from "@/framework/routes/routes"

interface EventClusterProps extends RouteClientComponentProps<"root"> {
    count: number
    liveCount: number
    onExpand: () => void
}

export const EventCluster = (props: EventClusterProps) => {
    const { t } = useTranslation("shared")
    const liveShare = `${String((props.liveCount / props.count) * 100)}%`

    return (
        <button
            type="button"
            aria-label={t("Map.Cluster", { count: props.count, live: props.liveCount })}
            onClick={props.onExpand}
            className="border-line shadow-hard-md flex size-12 cursor-pointer items-center justify-center rounded-full border-2 p-1"
            style={{
                background: `conic-gradient(var(--color-live) 0 ${liveShare}, var(--color-surface) ${liveShare} 100%)`,
            }}
        >
            <span className="bg-surface text-fg tp-pixel-lg flex size-full items-center justify-center rounded-full">
                {props.count}
            </span>
        </button>
    )
}
