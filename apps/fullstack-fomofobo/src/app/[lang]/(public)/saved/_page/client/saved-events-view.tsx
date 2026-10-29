"use client"

import { useQuery } from "@tanstack/react-query"
import { eventDetailUrlOf } from "domain/detail-urls"
import { cn } from "frontend-shared/styles"
import type { OccurrenceRef } from "models"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { useLanguage } from "react-i18n/hooks"
import { useTranslation } from "react-i18next"
import { IconButton } from "ui-components/icon-button"
import { PixelIconBack } from "ui-components/pixel-icons"

import {
    DetailPending,
    DetailSheet,
    DetailSidePanel,
} from "@/components/client/detail-dialog/detail-dialog"
import { EventDetail } from "@/components/client/event-detail/event-detail"
import { SavedEventsList } from "@/components/client/saved-events-list/saved-events-list"
import { routes } from "@/framework/routes/routes"
import type { RouteClientComponentProps } from "@/framework/routes/routes"
import { api } from "@/lib/api/client-api"
import { useBackToMap } from "@/lib/hooks/use-back-to-map"
import { useMediaQuery } from "@/lib/hooks/use-media-query"
import { useNow } from "@/lib/hooks/use-now"

import { InstallEntry } from "./install-entry"

const CLOCK_TICK_MS = 60_000

export const SavedEventsView = (props: RouteClientComponentProps<"saved">) => {
    const { t } = useTranslation("shared")
    const language = useLanguage()
    const goBack = useBackToMap()
    const router = useRouter()
    const now = useNow(CLOCK_TICK_MS)
    // The `md` breakpoint of the detail panel of the map
    const wide = useMediaQuery("(min-width: 48rem)")
    const [selectedRef, setSelectedRef] = useState<OccurrenceRef>()
    const panelRef = useRef<HTMLDivElement>(null)
    const detail = useQuery({
        ...api.getOccurrenceQuery({
            params: {
                eventId: selectedRef?.eventId ?? "",
                date: selectedRef?.date ?? "",
            },
            query: {},
        }),
        enabled: selectedRef !== undefined,
    })

    // A wide screen opens the detail of a saved event in a panel on the right, as the map does
    const panelOpen = wide && selectedRef !== undefined

    // A press outside the panel closes it, before a click on another event opens that one
    useEffect(() => {
        if (!panelOpen) {
            return undefined
        }
        const closeOnOutsidePress = (event: PointerEvent) => {
            const panel = panelRef.current
            if (
                panel !== null &&
                event.target instanceof Node &&
                !panel.contains(event.target)
            ) {
                setSelectedRef(undefined)
            }
        }
        document.addEventListener("pointerdown", closeOnOutsidePress)
        return () => {
            document.removeEventListener("pointerdown", closeOnOutsidePress)
        }
    }, [panelOpen])

    const closeDetail = () => {
        setSelectedRef(undefined)
    }
    const detailLabel = detail.data?.title ?? t("Preview.Title")
    const detailContent =
        detail.data === undefined || selectedRef === undefined ? (
            <DetailPending
                loadingText={t("Preview.Loading")}
                failedText={detail.isError ? t("Preview.Unavailable") : undefined}
                onClose={closeDetail}
            />
        ) : (
            <EventDetail
                occurrence={detail.data}
                now={now}
                shareUrl={eventDetailUrlOf(
                    globalThis.location.origin,
                    language,
                    selectedRef,
                )}
                onClose={closeDetail}
                onOpenVenue={venueId => {
                    router.push(
                        routes.root.path({
                            parameters: { lang: language },
                            query: { venue: venueId, detail: true },
                        }),
                    )
                }}
            />
        )

    return (
        <div className={cn({ "pr-[25.75rem]": panelOpen })}>
            <section className="mx-auto flex max-w-xl flex-col gap-4 p-4">
                <header className="flex items-center gap-3">
                    <IconButton
                        aria-label={t("Detail.Back")}
                        icon={<PixelIconBack />}
                        onClick={goBack}
                    />
                    <h1 className="tp-pixel-2xl uppercase">{t("PageTitle.Saved")}</h1>
                </header>
                <SavedEventsList now={now} onOpen={setSelectedRef} />
                <InstallEntry route={props.route} />
            </section>
            {selectedRef === undefined ? undefined : wide ? (
                <div ref={panelRef} className="fixed top-4 right-4 bottom-4 w-[23.75rem]">
                    <DetailSidePanel label={detailLabel} onClose={closeDetail}>
                        {detailContent}
                    </DetailSidePanel>
                </div>
            ) : (
                <DetailSheet open={true} label={detailLabel} onClose={closeDetail}>
                    {detailContent}
                </DetailSheet>
            )}
        </div>
    )
}
