"use client"

import { Serwist } from "@serwist/window"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { Alert } from "ui-components/alert"
import { Button } from "ui-components/button"

import { routeHandlers } from "@/framework/routes/routes"
import { loadedResourceEntries } from "@/lib/pwa/loaded-resources"

// `next dev` serves no precache manifest, and a worker there would keep stale pages.
const REGISTER = process.env.NODE_ENV === "production"

export const ServiceWorkerRegistrar = () => {
    const { t } = useTranslation("shared")
    const [waiting, setWaiting] = useState<Serwist>()

    useEffect(() => {
        if (!REGISTER || !("serviceWorker" in navigator)) {
            return
        }
        const serwist = new Serwist(
            routeHandlers.serviceWorker.path({ parameters: { path: "sw.js" } }),
            { scope: "/", type: "classic" },
        )
        serwist.addEventListener("waiting", () => {
            setWaiting(serwist)
        })
        // The first worker caches what the page loaded before it took control. An update reloads onto the new chunks.
        serwist.addEventListener("controlling", event => {
            if (event.isUpdate === true) {
                globalThis.location.reload()
                return
            }
            void serwist.messageSW({
                type: "CACHE_URLS",
                payload: {
                    urlsToCache: loadedResourceEntries(
                        new URL(globalThis.location.href),
                        performance
                            .getEntriesByType("resource")
                            .filter(entry => entry instanceof PerformanceResourceTiming),
                    ),
                },
            })
        })
        // A browser that refuses workers, such as a private window, keeps the online app.
        serwist.register().catch(() => undefined)
    }, [])

    return waiting === undefined ? undefined : (
        <div className="fixed inset-x-4 top-4 z-50 mx-auto max-w-xl">
            <Alert type="info" text={t("App.UpdateReady")}>
                <Button
                    variant="secondary"
                    size="sm"
                    className="self-start"
                    onClick={() => {
                        waiting.messageSkipWaiting()
                    }}
                >
                    {t("App.Reload")}
                </Button>
            </Alert>
        </div>
    )
}
