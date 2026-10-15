import type { ToastManager, ToastObject } from "@base-ui/react"
import { Toast as ToastPrimitive } from "@base-ui/react"
import { useEffect, useRef, useState } from "react"
import type { Require, Timeout } from "shared/types"
import { isDefined } from "shared/values"
import { match, P } from "ts-pattern"

import { useUiContext } from "../i18n/ui-context"
import {
    IconCheck,
    IconCheckCircle,
    IconCopy,
    IconInfo,
    IconWarningCircle,
    IconWarningTriangle,
    IconXMark,
} from "../icons/icons"
import type { ToastData, ToastDescriptionItem } from "./toast.helper"
import { getClipboardTextFromToastData, toastCopiedLabelExpiry } from "./toast.helper"
import { useToast } from "./toast.hooks"
import {
    toastActionsStyles,
    toastCloseStyles,
    toastContentStyles,
    toastCopiedLabelStyles,
    toastCopyStyles,
    toastDescriptionItemStyles,
    toastDescriptionStyles,
    toastIconStyles,
    toastRootStyles,
    toastTitleStyles,
    toastViewportStyles,
} from "./toast.styles"

interface ToastProviderProps {
    toastManager: ToastManager
    children?: React.ReactNode
}
export const ToastProvider = (props: ToastProviderProps) => (
    <ToastPrimitive.Provider toastManager={props.toastManager}>
        <ToastPrimitive.Portal>
            <ToastPrimitive.Viewport className={toastViewportStyles()}>
                <ToastList />
            </ToastPrimitive.Viewport>
        </ToastPrimitive.Portal>
        {props.children}
    </ToastPrimitive.Provider>
)

const ToastList = () => {
    const { list } = useToast()

    const toasts = list.map(toast => <Toast key={toast.id} toast={toast} />)
    return <>{toasts}</>
}

interface ToastProps {
    toast: Require<ToastObject<ToastData>, "data">
}
export const Toast = (props: ToastProps) => {
    const { i18n } = useUiContext()

    const showCopyButton = match(props.toast.data.type)
        .with(P.union("info", "success"), () => false)
        .with(P.union("warning", "error"), () => true)
        .exhaustive()

    const [copied, setCopied] = useState(false)

    const copiedTimeout = useRef<Timeout | undefined>(undefined)
    const clearCopiedTimeout = () => {
        if (!isDefined(copiedTimeout.current)) {
            return
        }
        clearTimeout(copiedTimeout.current)
    }

    const handleCopy = () => {
        void navigator.clipboard.writeText(
            getClipboardTextFromToastData(props.toast.data),
        )

        setCopied(true)
        clearCopiedTimeout()
        copiedTimeout.current = setTimeout(() => {
            setCopied(false)
        }, toastCopiedLabelExpiry)
    }

    useEffect(
        () => () => {
            if (isDefined(copiedTimeout.current)) {
                clearTimeout(copiedTimeout.current)
            }
        },
        [],
    )

    return (
        <ToastPrimitive.Root
            toast={props.toast}
            className={toastRootStyles(props.toast.data)}
        >
            <ToastPrimitive.Content className={toastContentStyles()}>
                <ToastIcon toast={props.toast.data} />
                <ToastPrimitive.Title className={toastTitleStyles(props.toast.data)}>
                    {props.toast.data.title}
                </ToastPrimitive.Title>
                <div className={toastActionsStyles()}>
                    {showCopyButton && (
                        <button
                            type="button"
                            aria-label={i18n.t("Toast.Copy", undefined)}
                            onClick={handleCopy}
                            className={toastCopyStyles(props.toast.data)}
                        >
                            <div
                                aria-hidden={!copied}
                                className={toastCopiedLabelStyles(
                                    props.toast.data,
                                    copied,
                                )}
                            >
                                <IconCheck />
                                <span>{i18n.t("Toast.Copied", undefined)}</span>
                            </div>
                            <IconCopy />
                        </button>
                    )}
                    <ToastPrimitive.Close
                        aria-label={i18n.t("Shared.Close", undefined)}
                        className={toastCloseStyles(props.toast.data)}
                    >
                        <IconXMark />
                    </ToastPrimitive.Close>
                </div>
                {props.toast.data.description.length > 0 && (
                    <ToastPrimitive.Description className={toastDescriptionStyles()}>
                        {props.toast.data.description.map(item => (
                            <ToastDescriptionItem
                                key={item.id}
                                toast={props.toast.data}
                                item={item}
                            />
                        ))}
                    </ToastPrimitive.Description>
                )}
            </ToastPrimitive.Content>
        </ToastPrimitive.Root>
    )
}

interface ToastIconProps {
    toast: ToastData
}
export const ToastIcon = (props: ToastIconProps) => {
    const styles = toastIconStyles(props.toast)
    const icon = match(props.toast.type)
        .with("info", () => <IconInfo className={styles} />)
        .with("success", () => <IconCheckCircle className={styles} />)
        .with("warning", () => <IconWarningTriangle className={styles} />)
        .with("error", () => <IconWarningCircle className={styles} />)
        .exhaustive()

    return <>{icon}</>
}

interface ToastDescriptionItemProps {
    toast: ToastData
    item: ToastDescriptionItem
}
const ToastDescriptionItem = (props: ToastDescriptionItemProps) => (
    <span className={toastDescriptionItemStyles(props.toast, props.item)}>
        {props.item.value}
    </span>
)
