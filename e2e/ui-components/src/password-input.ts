import { expect } from "@playwright/test"

import { t } from "./i18n"
import type { Scope } from "./shared"
import { escapeRegex } from "./shared"

const passwordInput = (scope: Scope, label: string) =>
    scope.getByLabel(label, { exact: true })

/**
 * @description Fills the password input
 * @param scope Search root
 * @param label Accessible label
 * @param value Value to fill
 */
export const fillPasswordInput = async (scope: Scope, label: string, value: string) => {
    await passwordInput(scope, label).fill(value)
}

/**
 * @description Clicks the visibility toggle of the password input
 * @param scope Search root
 * @param label Accessible label
 */
export const togglePasswordVisibility = async (scope: Scope, label: string) => {
    const name = new RegExp(
        `^(?:${escapeRegex(t("ui", "PasswordInput.Show"))}|${escapeRegex(t("ui", "PasswordInput.Hide"))})$`,
        "u",
    )
    await passwordInput(scope, label)
        .locator("xpath=..")
        .getByRole("button", { name })
        .click()
}

/**
 * @description Asserts the password is visible (`type="text"`)
 * @param scope Search root
 * @param label Accessible label
 */
export const expectPasswordVisible = async (scope: Scope, label: string) => {
    await expect(passwordInput(scope, label)).toHaveAttribute("type", "text")
}

/**
 * @description Asserts the password is hidden (`type="password"`)
 * @param scope Search root
 * @param label Accessible label
 */
export const expectPasswordHidden = async (scope: Scope, label: string) => {
    await expect(passwordInput(scope, label)).toHaveAttribute("type", "password")
}
