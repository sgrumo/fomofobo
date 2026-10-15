import { styles } from "frontend-shared/styles"

import {
    alertBackgroundStyles,
    alertForegroundStyles,
    alertIconColorStyles,
} from "../alert/alert.styles"
import type { ToastData, ToastDescriptionItem } from "./toast.helper"

export const toastViewportStyles = styles(
    () =>
        "fixed top-auto right-[1rem] bottom-[1rem] z-100 mx-auto flex w-[15.625rem] sm:right-[2rem] sm:bottom-[2rem] sm:w-[18.75rem]",
)

export const toastRootStyles = styles((toast: ToastData) => [
    "shadow-hard-lg absolute right-0 bottom-0 left-auto z-[calc(1000-var(--toast-index))] mr-0 h-[var(--height)] w-full origin-bottom [transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)-(var(--toast-index)*var(--peek))-(var(--shrink)*var(--height))))_scale(var(--scale))] rounded-lg p-4 select-none [--gap:0.75rem] [--height:var(--toast-frontmost-height,var(--toast-height))] [--offset-y:calc(var(--toast-offset-y)*-1+calc(var(--toast-index)*var(--gap)*-1)+var(--toast-swipe-movement-y))] [--peek:0.75rem] [--scale:calc(max(0,1-(var(--toast-index)*0.1)))] [--shrink:calc(1-var(--scale))] [transition:transform_0.5s_cubic-bezier(0.22,1,0.36,1),opacity_0.5s,height_0.15s] after:absolute after:top-full after:left-0 after:h-[calc(var(--gap)+1px)] after:w-full after:content-[''] data-[ending-style]:opacity-0 data-[expanded]:h-[var(--toast-height)] data-[expanded]:[transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--offset-y)))] data-[limited]:opacity-0 data-[starting-style]:[transform:translateY(150%)] data-[ending-style]:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))] data-[expanded]:data-[ending-style]:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))] data-[ending-style]:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))] data-[expanded]:data-[ending-style]:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))] data-[ending-style]:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))] data-[expanded]:data-[ending-style]:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))] data-[ending-style]:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))] data-[expanded]:data-[ending-style]:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))] [&[data-ending-style]:not([data-limited]):not([data-swipe-direction])]:[transform:translateY(150%)]",
    alertBackgroundStyles(toast.type),
])

export const toastContentStyles = styles(
    () =>
        "grid grid-cols-[auto_1fr_auto] gap-x-3 gap-y-1 overflow-hidden transition-opacity [transition-duration:250ms] data-[behind]:pointer-events-none data-[behind]:opacity-0 data-[expanded]:pointer-events-auto data-[expanded]:opacity-100",
)

export const toastActionsStyles = styles(() => "flex items-center gap-1 self-center")

export const toastCopyStyles = styles((toast: ToastData) => [
    "relative flex items-center justify-center rounded border-none bg-transparent [&>svg]:size-5",
    alertForegroundStyles(toast.type),
])

export const toastCopiedLabelStyles = styles((toast: ToastData, visible: boolean) => [
    "tp-pixel-sm pointer-events-none absolute -left-1 inline-flex -translate-x-full items-center gap-0.5 rounded-sm px-0.5 py-0.25 whitespace-nowrap opacity-0 transition-opacity [transition-duration:150ms] [&>svg]:size-4",
    {
        "opacity-100": visible,
        "text-info-surface bg-info": toast.type === "info",
        "text-success-surface bg-success": toast.type === "success",
        "text-warning-surface bg-warning": toast.type === "warning",
        "text-danger-surface bg-danger": toast.type === "error",
    },
])

export const toastCloseStyles = styles((toast: ToastData) => [
    "flex items-center justify-center self-center rounded border-none bg-transparent [&>svg]:size-5",
    alertForegroundStyles(toast.type),
])

export const toastTitleStyles = styles((toast: ToastData) => [
    "tp-body-md w-full text-start",
    alertForegroundStyles(toast.type),
])

export const toastIconStyles = styles((toast: ToastData) => [
    "size-5 self-center",
    alertIconColorStyles(toast.type),
])

export const toastDescriptionStyles = styles(
    () => "col-span-3 line-clamp-[12] break-words",
)

export const toastDescriptionItemStyles = styles(
    (toast: ToastData, item: ToastDescriptionItem) => [
        "block",
        {
            "tp-body-sm": item.style === "standard",
            "tp-pixel-sm": item.style === "mono",
        },
        alertForegroundStyles(toast.type),
    ],
)
