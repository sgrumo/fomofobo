import { useState } from "react"
import { Stepper } from "ui-components/stepper"
import type { Step, StepCompletion } from "ui-components/stepper"

type StepId = "one" | "two" | "three" | "four"

const steps: Array<Step<StepId>> = [
    { id: "one", label: "Step One" },
    { id: "two", label: "Step Two" },
    { id: "three", label: "Step Three" },
    { id: "four", label: "Step Four" },
]

const numbers: Record<StepId, number> = { one: 1, two: 2, three: 3, four: 4 }

const completion: Record<StepId, StepCompletion> = {
    one: true,
    two: "partially",
    three: false,
    four: false,
}

const enabled: Record<StepId, boolean> = {
    one: true,
    two: true,
    three: true,
    four: false,
}

export const StepperSamples = () => {
    const [currentStep, setCurrentStep] = useState<StepId>("two")

    return (
        <Stepper
            steps={steps}
            currentStep={currentStep}
            isStepEnabled={step => enabled[step.id]}
            isStepCompleted={step => completion[step.id]}
            getStepNumber={step => numbers[step.id]}
            onStepClick={step => {
                setCurrentStep(step.id)
            }}
            className="max-w-[40rem]"
        />
    )
}
