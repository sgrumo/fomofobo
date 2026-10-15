"use client"

import { isBrowser } from "es-toolkit"
import { cn } from "frontend-shared/styles"
import { useTranslation } from "react-i18next"
import { IconCopy } from "ui-components/icons"

import { globalToastManager } from "@/components/client/global-providers/global-providers-helper"

interface ErrorViewProps {
    error: Error
    /** `global` replaces the whole document; `inside-layout` keeps the navigation. */
    kind: "global" | "inside-layout"
    className?: string
}

/**
 * Renders a caught error with its stack and a copy action.
 *
 * Reads the stack in the browser only: a server stack names the paths of the machine
 * that rendered the page.
 */
export const ErrorView = (props: ErrorViewProps) => {
    const { t } = useTranslation("shared")

    const stack =
        (isBrowser() ? props.error.stack : undefined) ?? t("ErrorBoundary.NoStack")

    const onCopy = () => {
        void navigator.clipboard.writeText(stack)
        globalToastManager.add({
            type: "success",
            messages: [t("ErrorBoundary.ErrorCopied")],
        })
    }

    return (
        <div
            className={cn(
                "bg-danger flex flex-col items-center justify-center gap-4 overflow-auto p-8",
                props.className,
            )}
        >
            <p className="tp-pixel-2xl text-fg-inverse text-center">
                {t("ErrorBoundary.Title")}
            </p>
            <p className="tp-body-lg text-fg-inverse text-center">
                {t(
                    props.kind === "inside-layout"
                        ? "ErrorBoundary.DescriptionInsideLayout"
                        : "ErrorBoundary.Description",
                )}
            </p>
            <div className="flex flex-col items-center gap-4">
                <pre className="tp-pixel-sm text-danger bg-surface-muted max-h-80 max-w-[100rem] overflow-auto rounded p-2 text-wrap">
                    {stack}
                </pre>
                <button
                    type="button"
                    onClick={onCopy}
                    className="tp-pixel-md text-fg-inverse flex items-center gap-2 transition-transform active:scale-85"
                >
                    <IconCopy className="h-6 w-6" />
                    {t("ErrorBoundary.CopyError")}
                </button>
            </div>
        </div>
    )
}
