import type { Locator } from "@playwright/test"
import { expect } from "@playwright/test"

import { t } from "./i18n"
import type { Scope, TextMatch } from "./shared"
import { pageOf, textMatchToRegex } from "./shared"

/**
 * @description Returns the table locator
 * @param scope Search root
 * @param opts Optional column header name to pick one table
 * @remarks Pass `opts.header` when the scope holds many tables
 */
export const getTable = (scope: Scope, opts?: { header?: string }): Locator => {
    const table = scope.getByRole("table")
    return opts?.header === undefined
        ? table
        : table.filter({
              has: pageOf(scope).getByRole("columnheader", {
                  name: opts.header,
                  exact: true,
              }),
          })
}

/**
 * @description True when the value is one text matcher, not a list of them
 * @param value One matcher or a list
 */
const isSingleTextMatch = (value: TextMatch | TextMatch[]): value is TextMatch =>
    typeof value[0] === "string" && !Array.isArray(value[0])

/**
 * @description Returns the row filtered by one or more cell texts (chained filters)
 * @param scope Search root
 * @param cellTexts Item text matchers, one per cell
 * @remarks An `exact` match applies to one cell text, not to the whole row
 */
export const getTableRow = (
    scope: Scope,
    cellTexts: TextMatch | TextMatch[],
): Locator => {
    const matches = isSingleTextMatch(cellTexts) ? [cellTexts] : cellTexts
    return matches.reduce(
        (row, cellText) =>
            row.filter({ has: pageOf(scope).getByText(textMatchToRegex(cellText)) }),
        scope.getByRole("row"),
    )
}

/**
 * @description Asserts a visible row that matches the cell texts
 * @param scope Search root
 * @param cellTexts Item text matchers, one per cell
 */
export const expectTableRow = async (
    scope: Scope,
    cellTexts: TextMatch | TextMatch[],
) => {
    await expect(getTableRow(scope, cellTexts)).toBeVisible()
}

/**
 * @description Asserts no row matches the cell text
 * @param scope Search root
 * @param cellText Item text matcher
 */
export const expectNoTableRow = async (scope: Scope, cellText: TextMatch) => {
    await expect(getTableRow(scope, cellText)).toBeHidden()
}

/**
 * @description Asserts the body row count, without the empty-fallback row
 * @param scope Search root
 * @param count Expected row count
 * @remarks The scope must hold one table
 */
export const expectTableRowCount = async (scope: Scope, count: number) => {
    await expect(scope.locator("tbody tr:not([data-empty-fallback-row])")).toHaveCount(
        count,
    )
}

/**
 * @description Asserts a visible column header for every name
 * @param scope Search root
 * @param headers Column header names
 */
export const expectTableHeaders = async (scope: Scope, headers: string[]) => {
    for (const header of headers) {
        await expect(
            scope.getByRole("columnheader", { name: header, exact: true }),
        ).toBeVisible()
    }
}

/**
 * @description Asserts a visible empty-fallback row with the title
 * @param scope Search root
 * @param title Fallback title, localized default
 */
export const expectTableEmpty = async (scope: Scope, title?: string) => {
    const fallbackRow = scope.locator("tr[data-empty-fallback-row]")
    await expect(fallbackRow).toBeVisible()
    await expect(fallbackRow).toContainText(title ?? t("ui", "FallbackBox.EmptyTitle"))
}

/**
 * @description Clicks the action button inside the matching row
 * @param scope Search root
 * @param rowText Item text matcher
 * @param actionName Accessible name of the action button
 */
export const clickTableRowAction = async (
    scope: Scope,
    rowText: TextMatch,
    actionName: string,
) => {
    await getTableRow(scope, rowText)
        .getByRole("button", { name: actionName, exact: true })
        .click()
}
