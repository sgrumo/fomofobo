import { styles } from "frontend-shared/styles"

import type { AlertType } from "./alert.helper"

export const alertBackgroundStyles = styles((type: AlertType) => ({
    "bg-surface-muted": type === "loading",
    "bg-info-surface": type === "info",
    "bg-success-surface": type === "success",
    "bg-warning-surface": type === "warning",
    "bg-danger-surface": type === "error",
}))

export const alertIconColorStyles = styles((type: AlertType) => ({
    "text-fg-muted": type === "loading",
    "text-info": type === "info",
    "text-success": type === "success",
    "text-warning": type === "warning",
    "text-danger": type === "error",
}))

export const alertForegroundStyles = styles((type: AlertType) => ({
    "text-fg": type === "loading",
    "text-info": type === "info",
    "text-success": type === "success",
    "text-warning": type === "warning",
    "text-danger": type === "error",
}))

export const alertRootStyles = styles((type: AlertType) => [
    "flex flex-col justify-center gap-2 rounded-lg p-4",
    alertBackgroundStyles(type),
])

export const alertIconStyles = styles((type: AlertType) => [
    "size-6 shrink-0",
    alertIconColorStyles(type),
])

export const alertContentStyles = styles(() => "flex items-center gap-4")

export const alertTextListStyles = styles(() => "flex flex-col gap-1")

export const alertIconWrapperStyles = styles(
    () => "flex shrink-0 items-center justify-center",
)

export const alertTextStyles = styles((hasText: boolean) => [
    "grow overflow-auto",
    { hidden: !hasText },
])

export const alertLineStyles = styles((type: AlertType) => [
    "tp-body-md",
    alertForegroundStyles(type),
])
