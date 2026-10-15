import type { Locator } from "@playwright/test"
import { expect } from "@playwright/test"

import { clickButton } from "./button"
import { t } from "./i18n"
import type { Scope } from "./shared"
import { pageOf } from "./shared"

/**
 * @description Returns the dialog locator
 * @param scope Search root
 * @param title Accessible title
 */
export const getDialog = (scope: Scope, title?: string): Locator => {
    const page = pageOf(scope)
    return (
        page
            .getByRole("dialog", title === undefined ? {} : { name: title })
            // A toast is a dialog too, and it is the only one that is not modal
            .and(page.locator(':not([aria-modal="false"])'))
    )
}

/**
 * @description Clicks the trigger button and returns the open dialog for scoping
 * @param scope Search root
 * @param triggerName Accessible name of the trigger button
 * @param title Accessible title
 */
export const openDialog = async (
    scope: Scope,
    triggerName: string,
    title?: string,
): Promise<Locator> => {
    await clickButton(scope, triggerName)
    const dialog = getDialog(scope, title)
    await expect(dialog).toBeVisible()
    return dialog
}

/**
 * @description Closes the dialog with the localized close button
 * @param scope Search root
 * @param title Accessible title
 */
export const closeDialog = async (scope: Scope, title?: string) => {
    const dialog = getDialog(scope, title)
    await dialog
        .getByRole("button", { name: t("ui", "Shared.Close"), exact: true })
        .click()
    await expect(dialog).toBeHidden()
}

/**
 * @description Asserts the dialog is visible
 * @param scope Search root
 * @param title Accessible title
 */
export const expectDialogOpen = async (scope: Scope, title: string) => {
    await expect(getDialog(scope, title)).toBeVisible()
}

/**
 * @description Asserts the dialog is hidden
 * @param scope Search root
 * @param title Accessible title
 */
export const expectDialogClosed = async (scope: Scope, title?: string) => {
    await expect(getDialog(scope, title)).toBeHidden()
}
