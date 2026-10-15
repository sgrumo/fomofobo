import { expect } from "@playwright/test"

import type { Scope } from "./shared"

/**
 * @description Asserts the image with the alt text is visible
 * @param scope Search root
 * @param alt Alt text of the image
 * @remarks Passes for the dithered and the fallback rendering: the `img` keeps its alt in both
 */
export const expectDitheredImage = async (scope: Scope, alt: string) => {
    await expect(scope.getByRole("img", { name: alt, exact: true })).toBeVisible()
}
