"use client"

import { useSyncExternalStore } from "react"
import { useTranslation } from "react-i18next"
import { Button } from "ui-components/button"
import {
    DialogBody,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogRoot,
    DialogTitle,
} from "ui-components/dialog"

import type { StorePlatform } from "@/lib/app-stores/store-platform"
import { storePlatformOf } from "@/lib/app-stores/store-platform"
import { useLocalStorage } from "@/lib/hooks/use-local-storage"

interface DownloadAppDialogProps {
    storeUrls: Record<StorePlatform, string | undefined>
}

const subscribeNever = () => () => undefined

const readStorePlatform = () =>
    storePlatformOf(navigator.userAgent, navigator.maxTouchPoints)

// Asks a phone browser once to download the native app, when its store lists the app
export const DownloadAppDialog = (props: DownloadAppDialogProps) => {
    const { t } = useTranslation("shared")
    // The server render knows no device: the dialog opens after hydration
    const platform = useSyncExternalStore(
        subscribeNever,
        readStorePlatform,
        () => undefined,
    )
    const [dismissed, setDismissed] = useLocalStorage("app-download-dismissed")
    const storeUrl = platform === undefined ? undefined : props.storeUrls[platform]

    return platform === undefined || storeUrl === undefined ? undefined : (
        <DialogRoot
            open={!dismissed}
            onOpenChange={open => {
                setDismissed(!open)
            }}
        >
            <DialogContent className="max-h-[calc(min(20rem,90dvh))] w-[calc(min(24rem,90dvw))]">
                <DialogHeader>
                    <DialogTitle>{t("DownloadApp.Title")}</DialogTitle>
                </DialogHeader>
                <DialogBody>
                    <DialogDescription>
                        {t("DownloadApp.Description", {
                            store: t(`DownloadApp.Store.${platform}`),
                        })}
                    </DialogDescription>
                </DialogBody>
                <DialogFooter className="grid grid-cols-2 gap-2">
                    <DialogClose
                        render={
                            <Button variant="secondary" size="md" type="button">
                                {t("DownloadApp.Stay")}
                            </Button>
                        }
                    />
                    <Button
                        variant="primary"
                        size="md"
                        type="button"
                        onClick={() => {
                            setDismissed(true)
                            globalThis.location.assign(storeUrl)
                        }}
                    >
                        {t("DownloadApp.Open")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </DialogRoot>
    )
}
