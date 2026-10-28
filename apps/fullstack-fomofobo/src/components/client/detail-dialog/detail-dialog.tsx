"use client"

import type { ReactNode } from "react"
import { useRef } from "react"
import { useTranslation } from "react-i18next"
import { Alert } from "ui-components/alert"
import {
    BottomSheetContent,
    BottomSheetRoot,
    BottomSheetTitle,
} from "ui-components/bottom-sheet"
import { IconButton } from "ui-components/icon-button"
import { PixelIconClose } from "ui-components/pixel-icons"
import { Spinner } from "ui-components/spinner"

import { useNonModalDialog } from "@/lib/hooks/use-non-modal-dialog"

interface DetailDialogProps {
    label: string
    onClose: () => void
    children: ReactNode
}

export const DetailSidePanel = (props: DetailDialogProps) => {
    const panelRef = useRef<HTMLElement>(null)
    useNonModalDialog(panelRef, props.onClose)

    return (
        <section
            ref={panelRef}
            role="dialog"
            aria-modal={false}
            aria-label={props.label}
            tabIndex={-1}
            className="pixel-corners drop-shadow-hard-lg h-full outline-none"
        >
            {/* The frame of `pixel-corners` stays put while the content scrolls inside it */}
            <div className="relative h-full overflow-y-auto px-4 pt-4">
                {props.children}
            </div>
        </section>
    )
}

interface DetailSheetProps extends DetailDialogProps {
    open: boolean
}

export const DetailSheet = (props: DetailSheetProps) => (
    <BottomSheetRoot
        open={props.open}
        onOpenChange={open => {
            if (!open) {
                props.onClose()
            }
        }}
    >
        <BottomSheetContent>
            <BottomSheetTitle className="sr-only">{props.label}</BottomSheetTitle>
            {props.children}
        </BottomSheetContent>
    </BottomSheetRoot>
)

interface DetailPendingProps {
    loadingText: string
    failedText: string | undefined
    onClose: () => void
}

export const DetailPending = (props: DetailPendingProps) => {
    const { t } = useTranslation("shared")

    return (
        <div className="flex flex-col gap-3 pb-4">
            <IconButton
                aria-label={t("Preview.Close")}
                icon={<PixelIconClose />}
                size="sm"
                className="self-end"
                onClick={props.onClose}
            />
            {props.failedText === undefined ? (
                <Spinner title={props.loadingText} />
            ) : (
                <Alert type="error" text={props.failedText} />
            )}
        </div>
    )
}
