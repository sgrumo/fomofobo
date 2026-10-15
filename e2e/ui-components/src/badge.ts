import { expect } from "@playwright/test"

import type { Scope, TextMatch } from "./shared"
import { textMatchToRegex } from "./shared"

/**
 * @description Asserts a badge with the text is visible
 * @param scope Search root
 * @param text Badge text matcher
 */
export const expectBadge = async (scope: Scope, text: TextMatch) => {
    await expect(scope.getByText(textMatchToRegex(text))).toBeVisible()
}
