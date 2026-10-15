import { styles } from "frontend-shared/styles"

import type { AlertType } from "./alert.helper"

export const alertBackgroundStyles = styles((type: AlertType) => ({
    "bg-neutral-100 dark:bg-neutral-900": type === "loading",
    "bg-info-100 dark:bg-info-900": type === "info",
    "bg-success-100 dark:bg-success-900": type === "success",
    "bg-warning-100 dark:bg-warning-900": type === "warning",
    "bg-danger-100 dark:bg-danger-900": type === "error",
}))

export const alertIconColorStyles = styles((type: AlertType) => ({
    "text-neutral-600 dark:text-neutral-200": type === "loading",
    "text-info-600 dark:text-info-200": type === "info",
    "text-success-600 dark:text-success-200": type === "success",
    "text-warning-600 dark:text-warning-200": type === "warning",
    "text-danger-600 dark:text-danger-200": type === "error",
}))

export const alertForegroundStyles = styles((type: AlertType) => ({
    "text-neutral-800 dark:text-neutral-200": type === "loading",
    "text-info-800 dark:text-info-200": type === "info",
    "text-success-800 dark:text-success-200": type === "success",
    "text-warning-800 dark:text-warning-200": type === "warning",
    "text-danger-800 dark:text-danger-200": type === "error",
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
    "tp-b2-regular",
    alertForegroundStyles(type),
])
