import { cn } from "frontend-shared/styles"
import { match } from "ts-pattern"

import { useUiContext } from "../i18n/ui-context"
import { IconCheck } from "../icons/icons"
import type { Step, StepCompletion } from "./stepper.helper"
import {
    stepperConnectorStyles,
    stepperIndicatorStyles,
    stepperItemContentStyles,
    stepperItemStyles,
    stepperLabelStyles,
    stepperRootStyles,
} from "./stepper.styles"

interface StepperIndicatorProps {
    completion: StepCompletion
    number: number
    enabled: boolean
    current: boolean
}
const StepperIndicator = (props: StepperIndicatorProps) => (
    <span
        className={stepperIndicatorStyles({
            completion: props.completion,
            enabled: props.enabled,
            current: props.current,
        })}
    >
        {props.completion === true ? <IconCheck aria-hidden={true} /> : props.number}
    </span>
)

interface StepperLabelProps {
    label: string
    completion: StepCompletion
    enabled: boolean
    current: boolean
}
const StepperLabel = (props: StepperLabelProps) => (
    <span
        className={stepperLabelStyles({
            completion: props.completion,
            enabled: props.enabled,
            current: props.current,
        })}
    >
        {props.label}
    </span>
)

interface StepperConnectorProps {
    filled: boolean
}
const StepperConnector = (props: StepperConnectorProps) => (
    <span
        aria-hidden={true}
        className={stepperConnectorStyles({ filled: props.filled })}
    />
)

interface StepperItemProps {
    label: string
    completion: StepCompletion
    number: number
    enabled: boolean
    current: boolean
    isLast: boolean
    connectorFilled: boolean
    onClick: () => void
}
const StepperItem = (props: StepperItemProps) => {
    const { i18n } = useUiContext()

    const stepStatus = (completion: StepCompletion) =>
        match(completion)
            .with(true, () => i18n.t("Stepper.Status.Completed", undefined))
            .with("partially", () => i18n.t("Stepper.Status.Partial", undefined))
            .with(false, () => i18n.t("Stepper.Status.NotStarted", undefined))
            .exhaustive()

    const ariaLabel =
        props.enabled && !props.current
            ? i18n.t("Stepper.GoToStep", {
                  number: props.number,
                  label: props.label,
                  status: stepStatus(props.completion),
              })
            : i18n.t("Stepper.Step", {
                  number: props.number,
                  label: props.label,
                  status: stepStatus(props.completion),
              })

    return (
        <li className={stepperItemStyles({ isLast: props.isLast })}>
            <button
                type="button"
                disabled={!props.enabled}
                onClick={props.onClick}
                aria-current={props.current ? "step" : undefined}
                aria-label={ariaLabel}
                className={stepperItemContentStyles({ interactive: props.enabled })}
            >
                <StepperIndicator
                    completion={props.completion}
                    number={props.number}
                    enabled={props.enabled}
                    current={props.current}
                />
                <StepperLabel
                    label={props.label}
                    completion={props.completion}
                    enabled={props.enabled}
                    current={props.current}
                />
            </button>
            {!props.isLast && <StepperConnector filled={props.connectorFilled} />}
        </li>
    )
}

interface StepperProps<S extends string> {
    steps: Array<Step<S>>
    currentStep: NoInfer<S>
    isStepEnabled: (step: Step<NoInfer<S>>) => boolean
    isStepCompleted: (step: Step<NoInfer<S>>) => StepCompletion
    getStepNumber: (step: Step<NoInfer<S>>) => number
    onStepClick: (step: Step<NoInfer<S>>) => void
    className?: string
}
export const Stepper = <const S extends string>(props: StepperProps<S>) => {
    const { i18n } = useUiContext()

    const resolved = props.steps.map((step, index) => ({
        step,
        index,
        completion: props.isStepCompleted(step),
        number: props.getStepNumber(step),
        enabled: props.isStepEnabled(step),
        current: step.id === props.currentStep,
        isLast: index === props.steps.length - 1,
    }))

    const currentIndex = resolved.findIndex(item => item.current)
    const lastStartedIndex = resolved.reduce(
        (max, item) => (item.completion === false ? max : item.index),
        -1,
    )
    const filledUntil = Math.max(currentIndex, lastStartedIndex)

    return (
        <ol
            aria-label={i18n.t("Stepper.Steps", undefined)}
            className={cn(stepperRootStyles(), props.className)}
        >
            {resolved.map(item => (
                <StepperItem
                    key={item.step.id}
                    label={item.step.label}
                    completion={item.completion}
                    number={item.number}
                    enabled={item.enabled}
                    current={item.current}
                    isLast={item.isLast}
                    connectorFilled={item.index < filledUntil}
                    onClick={() => {
                        props.onStepClick(item.step)
                    }}
                />
            ))}
        </ol>
    )
}
