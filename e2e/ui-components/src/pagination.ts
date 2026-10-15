import { expect } from "@playwright/test"

import { t } from "./i18n"
import type { Scope } from "./shared"

const pageButton = (scope: Scope, pageNumber: number) =>
    scope.getByRole("button", {
        name: t("ui", "Pagination.GoToPage", { page: pageNumber }),
        exact: true,
    })

/**
 * @description Clicks the page button
 * @param scope Search root
 * @param pageNumber Target page number
 */
export const goToPage = async (scope: Scope, pageNumber: number) => {
    await pageButton(scope, pageNumber).click()
}

/**
 * @description Clicks the next-page button
 * @param scope Search root
 */
export const goToNextPage = async (scope: Scope) => {
    await scope
        .getByRole("button", { name: t("ui", "Pagination.NextPage"), exact: true })
        .click()
}

/**
 * @description Clicks the previous-page button
 * @param scope Search root
 */
export const goToPreviousPage = async (scope: Scope) => {
    await scope
        .getByRole("button", { name: t("ui", "Pagination.PreviousPage"), exact: true })
        .click()
}

/**
 * @description Asserts the current page
 * @param scope Search root
 * @param pageNumber Expected page number
 */
export const expectCurrentPage = async (scope: Scope, pageNumber: number) => {
    await expect(pageButton(scope, pageNumber)).toHaveAttribute("aria-current", "page")
}
