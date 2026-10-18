"use client"

import { useSyncExternalStore } from "react"
import { useTranslation } from "react-i18next"
import { Button } from "ui-components/button"

import type { RouteClientComponentProps } from "@/framework/routes/routes"
import { mapsProviderOf } from "@/lib/geo/directions-url"
import { showInstallPrompt, useInstallPrompt } from "@/lib/pwa/install-prompt"

type InstallContext = "installed" | "ios" | "other"

const subscribeNever = () => () => undefined

/**
 * @description Returns how this browser installs the app: already installed, through the iOS share sheet, or otherwise
 */
const readInstallContext = (): InstallContext => {
    const standalone =
        globalThis.matchMedia("(display-mode: standalone)").matches ||
        ("standalone" in navigator && navigator.standalone === true)
    const ios = mapsProviderOf(navigator.userAgent, navigator.maxTouchPoints) === "apple"
    return standalone ? "installed" : ios ? "ios" : "other"
}

export const InstallEntry = (_props: RouteClientComponentProps<"saved">) => {
    const { t } = useTranslation("shared")
    const prompt = useInstallPrompt()
    // The prerendered page knows no browser: the entry appears after hydration.
    const context = useSyncExternalStore(
        subscribeNever,
        readInstallContext,
        () => "installed",
    )

    const body =
        context === "installed" ? undefined : prompt === undefined ? (
            context === "ios" ? (
                <p className="tp-body-md text-fg-muted">{t("Install.IosGuide")}</p>
            ) : undefined
        ) : (
            <Button
                variant="secondary"
                size="sm"
                className="self-start"
                onClick={() => {
                    void showInstallPrompt(prompt)
                }}
            >
                {t("Install.Button")}
            </Button>
        )

    return body === undefined ? undefined : (
        <aside
            aria-label={t("Install.Title")}
            className="border-line flex flex-col gap-2 rounded-md border-2 border-dashed p-3"
        >
            <span className="tp-pixel-md uppercase">{t("Install.Title")}</span>
            {body}
        </aside>
    )
}
