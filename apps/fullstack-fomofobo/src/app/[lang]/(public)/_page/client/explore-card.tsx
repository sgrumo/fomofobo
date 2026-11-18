"use client"

import { useEffect, useId, useState } from "react"
import { useLanguage } from "react-i18n/hooks"
import { useTranslation } from "react-i18next"

import { RouteLink } from "@/framework/routes/route-link/route-link"
import type { RouteClientComponentProps } from "@/framework/routes/routes"
import { routes } from "@/framework/routes/routes"
import type { StorePlatform } from "@/lib/app-stores/store-platform"

interface ExploreCardProps extends RouteClientComponentProps<"root"> {
    storeUrls: Record<StorePlatform, string | undefined>
}

const STORE_LABELS = {
    ios: "Landing.DownloadIos",
    android: "Landing.DownloadAndroid",
} as const

// The red card turns over into the ways to open the map: the browser, and each store that lists the app
export const ExploreCard = (props: ExploreCardProps) => {
    const { t } = useTranslation("shared")
    const language = useLanguage()
    const menuId = useId()
    const [open, setOpen] = useState(false)
    // The card turns only after the first press, never on load
    const [turned, setTurned] = useState(false)
    const stores = (["ios", "android"] as const).flatMap(platform => {
        const url = props.storeUrls[platform]
        return url === undefined ? [] : [{ platform, url }]
    })

    const toggle = () => {
        setOpen(!open)
        setTurned(true)
    }

    useEffect(() => {
        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setOpen(false)
            }
        }
        if (open) {
            document.addEventListener("keydown", closeOnEscape)
        }
        return () => {
            document.removeEventListener("keydown", closeOnEscape)
        }
    }, [open])

    return (
        <div className="landing-card-slot">
            {open ? (
                <>
                    <div className="landing-veil" aria-hidden="true" onClick={toggle} />
                    <div className="landing-back">
                        <div className="landing-step bg-surface-inverse p-[3px]">
                            <div className="landing-step landing-back-face">
                                <button
                                    type="button"
                                    className="landing-mono landing-back-bar"
                                    aria-label={t("Landing.Back")}
                                    aria-expanded={true}
                                    aria-controls={menuId}
                                    // oxlint-disable-next-line jsx-a11y/no-autofocus -- the focus follows the card as it turns
                                    autoFocus={true}
                                    onClick={toggle}
                                >
                                    {t("Landing.Explore")}
                                </button>
                                <nav id={menuId} className="landing-back-rows">
                                    <RouteLink
                                        route={routes.map}
                                        parameters={{ lang: language }}
                                        query={{}}
                                        className="landing-mono landing-row"
                                    >
                                        <span className="landing-row-label">
                                            {t("Landing.OpenBrowser")}
                                        </span>
                                        <span className="landing-row-hint">
                                            {t("Landing.OpenBrowserHint")}
                                        </span>
                                    </RouteLink>
                                    {stores.map(store => (
                                        <a
                                            key={store.platform}
                                            href={store.url}
                                            className="landing-mono landing-row"
                                        >
                                            <span className="landing-row-label">
                                                {t(STORE_LABELS[store.platform])}
                                            </span>
                                            <span className="landing-row-hint">
                                                {t(`DownloadApp.Store.${store.platform}`)}
                                            </span>
                                        </a>
                                    ))}
                                </nav>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className={turned ? "landing-turn" : undefined}>
                    <button
                        type="button"
                        className="landing-card"
                        aria-label={t("Landing.Explore")}
                        aria-expanded={false}
                        // oxlint-disable-next-line jsx-a11y/no-autofocus -- the focus follows the card as it turns back
                        autoFocus={turned}
                        onClick={toggle}
                    >
                        <span className="landing-step bg-surface-inverse block p-[3px]">
                            <span className="landing-step landing-mono landing-card-face">
                                {t("Landing.Explore")}
                            </span>
                        </span>
                    </button>
                </div>
            )}
        </div>
    )
}
