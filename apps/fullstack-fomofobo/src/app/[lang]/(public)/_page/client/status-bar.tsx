"use client"

import { useTranslation } from "react-i18next"

import type { RouteClientComponentProps } from "@/framework/routes/routes"
import { shortDateOf } from "@/lib/events/local-format"
import type { StatusBarCounts } from "@/lib/events/status-bar-counts"
import { PLATFORM_TIME_ZONE } from "@/lib/platform/platform"

interface StatusBarProps extends RouteClientComponentProps<"root"> {
    now: Date
    counts: StatusBarCounts | undefined
    truncated: boolean
}

export const StatusBar = (props: StatusBarProps) => {
    const { t } = useTranslation("shared")
    // The server cuts the results past its cap, so a truncated count is a lower bound.
    const more = props.truncated ? "+" : ""

    return (
        <div
            role="status"
            className="bg-surface text-fg border-line shadow-hard-md tp-pixel-sm flex min-w-0 flex-1 items-center gap-2 rounded-md border-2 px-3 py-2 uppercase"
        >
            <span aria-hidden={true} className="bg-live size-2 shrink-0" />
            <span>{shortDateOf(props.now, PLATFORM_TIME_ZONE)}</span>
            {props.counts === undefined ? undefined : (
                <>
                    <span aria-hidden={true}>·</span>
                    <span>
                        {t("Map.StatusBar.Live", { count: props.counts.live, more })}
                    </span>
                    <span aria-hidden={true}>·</span>
                    <span>
                        {t("Map.StatusBar.UpcomingToday", {
                            count: props.counts.upcomingToday,
                            more,
                        })}
                    </span>
                </>
            )}
        </div>
    )
}
