"use client"

import { isBrowser } from "es-toolkit"
import { cn } from "frontend-shared/styles"
import type { TFunction } from "i18next"
import { Component } from "react"
import type { ReactNode } from "react"
import { useTranslation } from "react-i18next"
import { IconCopy } from "ui-components/icons"
import { useToast } from "ui-components/toast"
import type { ToastInput } from "ui-components/toast"

interface ComponentErrorBoundaryProps {
    children?: ReactNode
    className?: string
}

export const ComponentErrorBoundary = (props: ComponentErrorBoundaryProps) => {
    const { t } = useTranslation("shared")
    const toast = useToast()

    return (
        <ComponentErrorBoundaryInner
            t={t}
            addToast={toast.add}
            className={props.className}
        >
            {props.children}
        </ComponentErrorBoundaryInner>
    )
}

interface ComponentErrorBoundaryInnerProps {
    children: ReactNode
    t: TFunction<["shared"]>
    addToast: (input: ToastInput) => string
    className?: string
}

interface ComponentErrorBoundaryInnerState {
    error: Error | null
}

class ComponentErrorBoundaryInner extends Component<
    ComponentErrorBoundaryInnerProps,
    ComponentErrorBoundaryInnerState
> {
    public constructor(props: ComponentErrorBoundaryInnerProps) {
        super(props)
        this.state = { error: null }
    }

    /**
     * @description Returns the state holding the error caught in the subtree
     * @param error Error caught
     */
    public static getDerivedStateFromError(
        error: Error,
    ): Partial<ComponentErrorBoundaryInnerState> {
        return { error }
    }

    public render() {
        if (!this.state.error) {
            return this.props.children
        }

        const details =
            (isBrowser() ? this.state.error.stack : undefined) ?? this.state.error.message

        const onCopy = () => {
            void navigator.clipboard.writeText(details)
            this.props.addToast({
                type: "success",
                messages: [this.props.t("ErrorBoundary.ErrorCopied")],
            })
        }

        return (
            <div
                className={cn(
                    "bg-danger-600 dark:bg-danger-800 flex flex-col content-center items-center justify-center gap-2 rounded p-4",
                    this.props.className,
                )}
            >
                <p className="tp-b2-semibold text-center text-white">
                    {this.props.t("ErrorBoundary.Title")}
                </p>
                <button
                    type="button"
                    onClick={onCopy}
                    className="tp-b2-medium flex items-center gap-2 rounded text-white transition-transform active:scale-95"
                >
                    <IconCopy className="h-4 w-4" />
                    {this.props.t("ErrorBoundary.CopyError")}
                </button>
            </div>
        )
    }
}
