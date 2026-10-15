import type { Locator } from "@playwright/test"
import { expect } from "@playwright/test"

import { t } from "./i18n"
import type { Scope } from "./shared"

/**
 * @description Returns the search field input
 * @param scope Search root
 * @param label Accessible label
 */
export const getSearchField = (scope: Scope, label: string): Locator =>
    scope.getByRole("searchbox", { name: label, exact: true })

/**
 * @description Fills the search field and waits for the value
 * @param scope Search root
 * @param label Accessible label
 * @param text Text typed
 */
export const fillSearchField = async (scope: Scope, label: string, text: string) => {
    const input = getSearchField(scope, label)
    await input.fill(text)
    await expect(input).toHaveValue(text)
}

/**
 * @description Clears the search field with its clear button and waits for the empty value
 * @param scope Search root, narrow enough to hold one search field
 * @param label Accessible label
 */
export const resetSearchField = async (scope: Scope, label: string) => {
    const clear = scope.getByRole("button", {
        name: t("ui", "SearchField.Clear"),
        exact: true,
    })
    await clear.click()
    await expect(getSearchField(scope, label)).toHaveValue("")
    await expect(clear).toBeHidden()
}

/**
 * @description Asserts the value of the search field
 * @param scope Search root
 * @param label Accessible label
 * @param value Expected value
 */
export const expectSearchFieldValue = async (
    scope: Scope,
    label: string,
    value: string,
) => {
    await expect(getSearchField(scope, label)).toHaveValue(value)
}
