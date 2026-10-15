import type { Locator } from "@playwright/test"
import { expect } from "@playwright/test"

import { clickButton } from "./button"
import { t } from "./i18n"
import type { Scope } from "./shared"
import { pageOf } from "./shared"

/**
 * @description Returns the alert dialog locator
 * @param scope Search root
 * @param title Accessible title
 */
export const getAlertDialog = (scope: Scope, title?: string): Locator => {
    const page = pageOf(scope)
    return (
        page
            .getByRole("alertdialog", title === undefined ? {} : { name: title })
            // A high-priority toast is an alert dialog too, and it is never modal
            .and(page.locator(':not([aria-modal="false"])'))
    )
}

/**
 * @description Clicks the trigger button and returns the open alert dialog for scoping
 * @param scope Search root
 * @param triggerName Accessible name of the trigger button
 * @param title Accessible title
 */
export const openAlertDialog = async (
    scope: Scope,
    triggerName: string,
    title?: string,
): Promise<Locator> => {
    await clickButton(scope, triggerName)
    const dialog = getAlertDialog(scope, title)
    await expect(dialog).toBeVisible()
    return dialog
}

/**
 * @description Closes the alert dialog with the localized close button
 * @param scope Search root
 * @param title Accessible title
 */
export const closeAlertDialog = async (scope: Scope, title?: string) => {
    const dialog = getAlertDialog(scope, title)
    await dialog
        .getByRole("button", { name: t("ui", "Shared.Close"), exact: true })
        .click()
    await expect(dialog).toBeHidden()
}

/**
 * @description Cancels the alert dialog and asserts it hidden
 * @param scope Search root
 * @param cancelLabel Cancel button name, localized default
 */
export const cancelAlertDialog = async (scope: Scope, cancelLabel?: string) => {
    const dialog = getAlertDialog(scope)
    await dialog
        .getByRole("button", {
            name: cancelLabel ?? t("ui", "Shared.Cancel"),
            exact: true,
        })
        .click()
    await expect(dialog).toBeHidden()
}

/**
 * @description Confirms the alert dialog and asserts it hidden
 * @param scope Search root
 * @param opts Confirm button name (localized default) and type-to-confirm text
 */
export const confirmAlertDialog = async (
    scope: Scope,
    opts?: { enterToConfirm?: string; confirmLabel?: string },
) => {
    const dialog = getAlertDialog(scope)
    if (opts?.enterToConfirm !== undefined) {
        await dialog
            .getByPlaceholder(opts.enterToConfirm, { exact: true })
            .fill(opts.enterToConfirm)
    }
    await dialog
        .getByRole("button", {
            name: opts?.confirmLabel ?? t("ui", "Shared.Confirm"),
            exact: true,
        })
        .click()
    await expect(dialog).toBeHidden()
}

/**
 * @description Asserts a visible alert dialog with the title and optional description
 * @param scope Search root
 * @param opts Expected title and description
 */
export const expectAlertDialog = async (
    scope: Scope,
    opts: { title: string; description?: string },
) => {
    const dialog = getAlertDialog(scope, opts.title)
    await expect(dialog).toBeVisible()
    // Every element contains "", so an absent description is a no-op check
    await expect(dialog).toContainText(opts.description ?? "")
}
