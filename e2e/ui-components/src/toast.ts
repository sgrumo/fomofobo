import type { Locator } from "@playwright/test"
import { expect } from "@playwright/test"
import { match, P } from "ts-pattern"

import { t } from "./i18n"
import type { Scope } from "./shared"
import { pageOf } from "./shared"

export type ToastMatch = { type: "success" | "warning" | "error" } | { title: string }

/**
 * @description Returns the explicit title, or the localized title of the toast type
 * @param toastMatch Toast type or exact title
 */
const toastTitle = (toastMatch: ToastMatch): string =>
    match(toastMatch)
        .with({ title: P.string }, ({ title }) => title)
        .with({ type: "success" }, () => t("ui", "Toast.Success.Title"))
        .with({ type: "warning" }, () => t("ui", "Toast.Warning.Title"))
        .with({ type: "error" }, () => t("ui", "Toast.Error.Generic.Title"))
        .exhaustive()

/**
 * @description Returns the toast locator by its title
 * @param scope Search root
 * @param title Accessible title
 */
const toastByTitle = (scope: Scope, title: string): Locator =>
    pageOf(scope)
        // The viewport's accessible name is hardcoded by Base UI, not app i18n
        .getByRole("region", { name: "Notifications" })
        // High-priority toasts render as alertdialog, the rest as dialog
        .locator('[role="dialog"], [role="alertdialog"]')
        .filter({ hasText: title })

/**
 * @description Returns the toast locator by its title and its description
 * @param scope Search root
 * @param toastMatch Toast type or exact title
 * @param description Expected description
 */
const toast = (scope: Scope, toastMatch: ToastMatch, description?: string): Locator =>
    // Every element contains "", so an absent description widens nothing
    toastByTitle(scope, toastTitle(toastMatch)).filter({ hasText: description ?? "" })

/**
 * @description Asserts a visible toast
 * @param scope Search root
 * @param toastMatch Toast type or exact title
 * @param description Expected description
 */
export const expectToast = async (
    scope: Scope,
    toastMatch: ToastMatch,
    description?: string,
) => {
    await expect(toast(scope, toastMatch, description)).toBeVisible()
}

/**
 * @description Dismisses the toast with its close button
 * @param scope Search root
 * @param toastMatch Toast type or exact title
 * @param description Expected description
 * @remarks Retried: the close button answers only once the toast is done animating in
 */
export const dismissToast = async (
    scope: Scope,
    toastMatch: ToastMatch,
    description?: string,
) => {
    const target = toast(scope, toastMatch, description)
    await expect(async () => {
        if ((await target.count()) === 0) {
            // Expired on its own
            return
        }

        // Every step of the attempt is short: the loop reads the toast again
        await target.hover({ timeout: 1000 })
        await target
            .getByRole("button", { name: t("ui", "Shared.Close"), exact: true })
            .click({ timeout: 1000 })
        await expect(target).toHaveCount(0, { timeout: 1000 })
    }).toPass({ timeout: 15_000 })
}
