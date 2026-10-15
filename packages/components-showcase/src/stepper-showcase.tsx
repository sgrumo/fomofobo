import { cn } from "frontend-shared/styles"
import { useState } from "react"
import { Stepper } from "ui-components/stepper"
import type { Step, StepCompletion } from "ui-components/stepper"

type StepId = "account" | "profile" | "billing" | "review"

const steps: Array<Step<StepId>> = [
    { id: "account", label: "Account" },
    { id: "profile", label: "Profile" },
    { id: "billing", label: "Billing" },
    { id: "review", label: "Review" },
]

const allEnabled: Record<StepId, boolean> = {
    account: true,
    profile: true,
    billing: true,
    review: true,
}

const sequentialNumbers: Record<StepId, number> = {
    account: 1,
    profile: 2,
    billing: 3,
    review: 4,
}

const customNumbers: Record<StepId, number> = {
    account: 1,
    profile: 1.5,
    billing: 2,
    review: 4.1,
}

const interactiveCompletion: Record<StepId, StepCompletion> = {
    account: true,
    profile: true,
    billing: "partially",
    review: false,
}

const fillCompletions: Record<StepId, StepCompletion> = {
    account: true,
    profile: "partially",
    billing: false,
    review: false,
}

const currentOnEmptyCompletion: Record<StepId, StepCompletion> = {
    account: true,
    profile: true,
    billing: false,
    review: false,
}

const oneDisabled: Record<StepId, boolean> = {
    account: true,
    profile: true,
    billing: true,
    review: false,
}

const StepperInteractiveShowcase = () => {
    const [currentStep, setCurrentStep] = useState<StepId>("billing")

    return (
        <div className="flex flex-col gap-2">
            <p className="tp-body-sm text-fg-muted">Current step: {currentStep}</p>
            <Stepper
                steps={steps}
                currentStep={currentStep}
                isStepEnabled={step => allEnabled[step.id]}
                isStepCompleted={step => interactiveCompletion[step.id]}
                getStepNumber={step => sequentialNumbers[step.id]}
                onStepClick={step => {
                    setCurrentStep(step.id)
                }}
            />
        </div>
    )
}

interface StepperExampleShowcaseProps {
    initialCurrentStep: StepId
    completionById: Record<StepId, StepCompletion>
    enabledById: Record<StepId, boolean>
    numberById: Record<StepId, number>
}

const StepperExampleShowcase = (props: StepperExampleShowcaseProps) => {
    const [currentStep, setCurrentStep] = useState<StepId>(props.initialCurrentStep)

    return (
        <Stepper
            steps={steps}
            currentStep={currentStep}
            isStepEnabled={step => props.enabledById[step.id]}
            isStepCompleted={step => props.completionById[step.id]}
            getStepNumber={step => props.numberById[step.id]}
            onStepClick={step => {
                setCurrentStep(step.id)
            }}
        />
    )
}

interface StepperShowcaseProps {
    className?: string
}

export const StepperShowcase = (props: StepperShowcaseProps) => (
    <div className={cn("flex w-full flex-col gap-6", props.className)}>
        <p className="tp-pixel-lg">Interactive — the ring (current) moves, fills stay</p>
        <StepperInteractiveShowcase />
        <p className="tp-pixel-lg">Fill states — empty, partial, complete</p>
        <StepperExampleShowcase
            initialCurrentStep="profile"
            completionById={fillCompletions}
            enabledById={allEnabled}
            numberById={sequentialNumbers}
        />
        <p className="tp-pixel-lg">Current on an empty step, with a disabled step</p>
        <StepperExampleShowcase
            initialCurrentStep="billing"
            completionById={currentOnEmptyCompletion}
            enabledById={oneDisabled}
            numberById={sequentialNumbers}
        />
        <p className="tp-pixel-lg">Custom step numbers</p>
        <StepperExampleShowcase
            initialCurrentStep="profile"
            completionById={fillCompletions}
            enabledById={allEnabled}
            numberById={customNumbers}
        />
    </div>
)
