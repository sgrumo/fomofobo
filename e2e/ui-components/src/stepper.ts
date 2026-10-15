import { expect } from "@playwright/test"
import { match } from "ts-pattern"

import { t } from "./i18n"
import type { Scope } from "./shared"
import { escapeRegex } from "./shared"

/**
 * @description Returns the step button by its visible label
 * @param scope Search root
 * @param stepLabel Visible step label
 * @remarks Matches the visible label, since the accessible name is interpolated i18n text
 */
const stepButton = (scope: Scope, stepLabel: string) =>
    scope.getByRole("listitem").filter({ hasText: stepLabel }).getByRole("button")

/**
 * @description Clicks the step button and asserts the step is current
 * @param scope Search root
 * @param stepLabel Visible step label
 */
export const goToStep = async (scope: Scope, stepLabel: string) => {
    await stepButton(scope, stepLabel).click()
    await expectCurrentStep(scope, stepLabel)
}

/**
 * @description Asserts the step is current (`aria-current="step"`)
 * @param scope Search root
 * @param stepLabel Visible step label
 */
export const expectCurrentStep = async (scope: Scope, stepLabel: string) => {
    await expect(stepButton(scope, stepLabel)).toHaveAttribute("aria-current", "step")
}

export type StepStatus = "completed" | "not-started" | "partial"

export interface ExpectStepStatusOpts {
    number: number
    label: string
    status: StepStatus
}

/**
 * @description Asserts the full interpolated aria-label of a step
 * @param scope Search root
 * @param opts Step number, label, and status
 */
export const expectStepStatus = async (scope: Scope, opts: ExpectStepStatusOpts) => {
    const statusKey = match(opts.status)
        .with("completed", () => "Stepper.Status.Completed")
        .with("not-started", () => "Stepper.Status.NotStarted")
        .with("partial", () => "Stepper.Status.Partial")
        .exhaustive()
    const params = {
        number: opts.number,
        label: opts.label,
        status: t("ui", statusKey),
    }

    // The component uses GoToStep for clickable steps and Step for the rest
    const name = new RegExp(
        `^(?:${escapeRegex(t("ui", "Stepper.GoToStep", params))}|${escapeRegex(t("ui", "Stepper.Step", params))})$`,
        "u",
    )
    await expect(scope.getByRole("button", { name })).toBeVisible()
}

/**
 * @description Asserts the step button is disabled
 * @param scope Search root
 * @param stepLabel Visible step label
 */
export const expectStepDisabled = async (scope: Scope, stepLabel: string) => {
    await expect(stepButton(scope, stepLabel)).toBeDisabled()
}
