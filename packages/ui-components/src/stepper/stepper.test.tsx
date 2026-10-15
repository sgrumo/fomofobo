import { userEvent } from "@testing-library/user-event"
import { match } from "ts-pattern"
import { describe, expect, it, vi } from "vitest"

import { render, screen } from "../test/test-utils"
import { testT as t } from "../test/ui-i18n"
import { Stepper } from "./stepper"
import type { Step } from "./stepper.helper"

type Id = "first" | "second" | "third"

const steps: Array<Step<Id>> = [
    { id: "first", label: "First" },
    { id: "second", label: "Second" },
    { id: "third", label: "Third" },
]

/**
 * @remarks Holds a fractional number for `second`, to prove a non-integer step renders
 */
const stepNumbers: Record<Id, number> = {
    first: 1,
    second: 1.5,
    third: 2,
}

/**
 * @description Returns the number of the step from the fixture map
 * @param step Step looked up
 */
const getStepNumber = (step: Step<Id>) => stepNumbers[step.id]

describe("Stepper", () => {
    it("renders every step", () => {
        render(
            <Stepper
                steps={steps}
                currentStep="first"
                isStepEnabled={() => true}
                isStepCompleted={() => false}
                getStepNumber={getStepNumber}
                onStepClick={vi.fn<(step: Step<Id>) => void>()}
            />,
        )

        expect(screen.getByText("First")).toBeInTheDocument()
        expect(screen.getByText("Second")).toBeInTheDocument()
        expect(screen.getByText("Third")).toBeInTheDocument()
    })

    it("renders the step numbers returned by getStepNumber", () => {
        render(
            <Stepper
                steps={steps}
                currentStep="first"
                isStepEnabled={() => true}
                isStepCompleted={() => false}
                getStepNumber={getStepNumber}
                onStepClick={vi.fn<(step: Step<Id>) => void>()}
            />,
        )

        expect(screen.getByText("1")).toBeInTheDocument()
        expect(screen.getByText("1.5")).toBeInTheDocument()
        expect(screen.getByText("2")).toBeInTheDocument()
    })

    it("labels enabled non-current steps with a go-to-step description", () => {
        render(
            <Stepper
                steps={steps}
                currentStep="third"
                isStepEnabled={() => true}
                isStepCompleted={() => false}
                getStepNumber={getStepNumber}
                onStepClick={vi.fn<(step: Step<Id>) => void>()}
            />,
        )

        expect(
            screen.getByRole("button", {
                name: t("Stepper.GoToStep", {
                    number: 1,
                    label: "First",
                    status: t("Stepper.Status.NotStarted", undefined),
                }),
            }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole("button", {
                name: t("Stepper.GoToStep", {
                    number: 1.5,
                    label: "Second",
                    status: t("Stepper.Status.NotStarted", undefined),
                }),
            }),
        ).toBeInTheDocument()
    })

    it("exposes each step's number and completion status to assistive tech", () => {
        render(
            <Stepper
                steps={steps}
                currentStep="third"
                isStepEnabled={() => true}
                isStepCompleted={step =>
                    match(step.id)
                        .with("first", () => true)
                        .with("second", () => "partially" as const)
                        .with("third", () => false)
                        .exhaustive()
                }
                getStepNumber={getStepNumber}
                onStepClick={vi.fn<(step: Step<Id>) => void>()}
            />,
        )

        expect(
            screen.getByRole("button", {
                name: t("Stepper.GoToStep", {
                    number: 1,
                    label: "First",
                    status: t("Stepper.Status.Completed", undefined),
                }),
            }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole("button", {
                name: t("Stepper.GoToStep", {
                    number: 1.5,
                    label: "Second",
                    status: t("Stepper.Status.Partial", undefined),
                }),
            }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole("button", {
                name: t("Stepper.Step", {
                    number: 2,
                    label: "Third",
                    status: t("Stepper.Status.NotStarted", undefined),
                }),
            }),
        ).toBeInTheDocument()
    })

    it("marks the currentStep as the current step regardless of its status", () => {
        render(
            <Stepper
                steps={steps}
                currentStep="second"
                isStepEnabled={() => true}
                isStepCompleted={() => false}
                getStepNumber={getStepNumber}
                onStepClick={vi.fn<(step: Step<Id>) => void>()}
            />,
        )

        expect(screen.getByRole("button", { current: "step" })).toHaveTextContent(
            "Second",
        )
    })

    it("calls onStepClick when an enabled step is clicked", async () => {
        const user = userEvent.setup()
        const onStepClick = vi.fn<(step: Step<Id>) => void>()

        render(
            <Stepper
                steps={steps}
                currentStep="first"
                isStepEnabled={() => true}
                isStepCompleted={() => false}
                getStepNumber={getStepNumber}
                onStepClick={onStepClick}
            />,
        )

        await user.click(screen.getByRole("button", { name: /Second/u }))

        expect(onStepClick).toHaveBeenCalledWith({ id: "second", label: "Second" })
    })

    it("does not call onStepClick when a disabled step is clicked", async () => {
        const user = userEvent.setup()
        const onStepClick = vi.fn<(step: Step<Id>) => void>()

        render(
            <Stepper
                steps={steps}
                currentStep="first"
                isStepEnabled={step => step.id !== "second"}
                isStepCompleted={() => false}
                getStepNumber={getStepNumber}
                onStepClick={onStepClick}
            />,
        )

        await user.click(screen.getByRole("button", { name: /Second/u }))

        expect(onStepClick).not.toHaveBeenCalled()
    })
})
