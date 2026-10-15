import { expect } from "@playwright/test"

import type { Scope } from "./shared"
import { getTickProgress } from "./tick-progress"

/**
 * @description Asserts the timeline bar and its start, now and end labels
 * @param scope Search root, narrow enough to hold one timeline
 * @param label Accessible label of the bar
 * @param labels Expected label texts
 */
export const expectTimeline = async (
    scope: Scope,
    label: string,
    labels: { start: string; now: string; end: string },
) => {
    await expect(getTickProgress(scope, label)).toBeVisible()
    for (const text of [labels.start, labels.now, labels.end]) {
        await expect(scope.getByText(text, { exact: true })).toBeVisible()
    }
}
