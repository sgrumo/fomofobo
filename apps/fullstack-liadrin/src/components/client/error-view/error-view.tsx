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
                "bg-danger-600 dark:bg-danger-800 flex flex-col items-center justify-center gap-4 overflow-auto p-8",
                props.className,
            )}
        >
            <p className="tp-h1 text-center text-white">{t("ErrorBoundary.Title")}</p>
            <p className="tp-b1-regular text-center text-white">
                {t(
                    props.kind === "inside-layout"
                        ? "ErrorBoundary.DescriptionInsideLayout"
                        : "ErrorBoundary.Description",
                )}
            </p>
            <div className="flex flex-col items-center gap-4">
                <pre className="tp-mono-c1 text-danger-600 max-h-80 max-w-[100rem] overflow-auto rounded bg-neutral-100 p-2 text-wrap">
                    {stack}
                </pre>
                <button
                    type="button"
                    onClick={onCopy}
                    className="tp-b1-medium flex items-center gap-2 text-white transition-transform active:scale-85"
                >
                    <IconCopy className="h-6 w-6" />
                    {t("ErrorBoundary.CopyError")}
                </button>
            </div>
        </div>
    )
}
