import { expect } from "@playwright/test"
import { isDefined } from "shared/values"

import { t } from "./i18n"
import type { Scope } from "./shared"

/**
 * @description Asserts a visible empty-fallback title
 * @param scope Search root
 * @param title Fallback title, localized default
 */
export const expectEmptyFallback = async (scope: Scope, title?: string) => {
    await expect(
        scope.getByText(title ?? t("ui", "FallbackBox.EmptyTitle"), { exact: true }),
    ).toBeVisible()
}

/**
 * @description Asserts a visible error-fallback title and optional description
 * @param scope Search root
 * @param title Expected title
 * @param description Expected description
 */
export const expectErrorFallback = async (
    scope: Scope,
    title: string,
    description?: string,
) => {
    for (const text of [title, description].filter(isDefined)) {
        await expect(scope.getByText(text, { exact: true })).toBeVisible()
    }
}
