"use client"

import { useTranslation } from "react-i18next"
import { IconInfo } from "ui-components/icons"

import type { RouteClientComponentProps } from "@/framework/routes/routes"

const SOURCES = [
    { key: "OpenFreeMap", url: "https://openfreemap.org" },
    { key: "OpenMapTiles", url: "https://www.openmaptiles.org/" },
    { key: "OpenStreetMap", url: "https://www.openstreetmap.org/copyright" },
] as const

const CREDIT_ID = "map-credit"

interface MapCreditProps extends RouteClientComponentProps<"root"> {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export const MapCredit = (props: MapCreditProps) => {
    const { t } = useTranslation("shared")

    return (
        <div className="pointer-events-none absolute right-4 bottom-1.5 left-4 flex items-center justify-end gap-1">
            {props.open ? (
                <p
                    id={CREDIT_ID}
                    className="tp-body-sm text-fg-inverse pointer-events-auto flex min-w-0 gap-1 [&>a]:truncate [&>a]:underline"
                >
                    {SOURCES.map(source => (
                        <a
                            key={source.key}
                            href={source.url}
                            target="_blank"
                            rel="noreferrer"
                        >
                            {t(`Map.Attribution.${source.key}`)}
                        </a>
                    ))}
                </p>
            ) : undefined}
            <button
                type="button"
                aria-label={t("Map.Credits")}
                aria-expanded={props.open}
                aria-controls={props.open ? CREDIT_ID : undefined}
                className="text-fg-inverse pointer-events-auto shrink-0 cursor-pointer p-1 [&>svg]:size-4"
                onClick={() => {
                    props.onOpenChange(!props.open)
                }}
            >
                <IconInfo aria-hidden={true} strokeWidth={2} />
            </button>
        </div>
    )
}
