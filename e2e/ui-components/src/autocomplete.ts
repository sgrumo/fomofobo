import { expect } from "@playwright/test"

import { t } from "./i18n"
import type { Scope, TextMatch } from "./shared"
import { pageOf, textMatchToRegex } from "./shared"

const autocompleteInput = (scope: Scope, label: string) =>
    scope.getByLabel(label, { exact: true })

/**
 * @description Fills the autocomplete input
 * @param scope Search root
 * @param label Accessible label
 * @param text Text to fill
 */
export const enterAutocompleteInput = async (
    scope: Scope,
    label: string,
    text: string,
) => {
    await autocompleteInput(scope, label).fill(text)
}

/**
 * @description Clicks the input, then selects the matching option from the popup
 * @param scope Search root
 * @param label Accessible label
 * @param item Item text matcher
 */
export const selectAutocompleteItem = async (
    scope: Scope,
    label: string,
    item: TextMatch,
) => {
    const page = pageOf(scope)
    const input = autocompleteInput(scope, label)
    await input.click()

    const option = page.getByRole("option", { name: textMatchToRegex(item) })
    await expect(option).toBeVisible()
    await option.click()
    await expect(page.getByRole("listbox")).toBeHidden()
}

/**
 * @description Asserts the autocomplete input value
 * @param scope Search root
 * @param label Accessible label
 * @param value Expected value
 */
export const expectAutocompleteValue = async (
    scope: Scope,
    label: string,
    value: string,
) => {
    await expect(autocompleteInput(scope, label)).toHaveValue(value)
}

/**
 * @description Asserts the "no results" status inside the open popup
 * @param scope Search root
 */
export const expectAutocompleteEmpty = async (scope: Scope) => {
    await expect(
        pageOf(scope).getByText(t("ui", "Combobox.Empty"), { exact: true }),
    ).toBeVisible()
}
