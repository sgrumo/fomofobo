import { expect } from "@playwright/test"

import type { Scope } from "./shared"

/**
 * @description Asserts a visible avatar image by its alt text
 * @param scope Search root
 * @param fullName Person full name; the alt text is `<fullName> avatar`
 */
export const expectAvatarImage = async (scope: Scope, fullName: string) => {
    await expect(scope.getByAltText(`${fullName} avatar`, { exact: true })).toBeVisible()
}

/**
 * @description Asserts a visible avatar fallback text
 * @param scope Search root
 * @param text Expected text
 */
export const expectAvatarFallback = async (scope: Scope, text: string) => {
    await expect(scope.getByText(text, { exact: true })).toBeVisible()
}
