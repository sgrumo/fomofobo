import { expect } from "@playwright/test"

import type { Scope } from "./shared"

/**
 * @description Returns the spinner locator by its title
 * @param scope Search root
 * @param title Accessible title
 * @remarks A titled Spinner exposes the title as its aria-label
 */
const spinner = (scope: Scope, title: string) => scope.getByLabel(title, { exact: true })

/**
 * @description Asserts a visible spinner
 * @param scope Search root
 * @param title Accessible title
 */
export const expectSpinner = async (scope: Scope, title: string) => {
    await expect(spinner(scope, title)).toBeVisible()
}

/**
 * @description Asserts the spinner is hidden
 * @param scope Search root
 * @param title Accessible title
 */
export const expectSpinnerHidden = async (scope: Scope, title: string) => {
    await expect(spinner(scope, title)).toBeHidden()
}
