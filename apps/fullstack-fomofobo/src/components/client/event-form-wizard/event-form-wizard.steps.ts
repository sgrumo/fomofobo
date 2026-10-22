import type { FormErrors } from "frontend-shared/types"
import type { StepCompletion } from "ui-components/stepper"

import type { EventFormState } from "@/components/client/event-form/event-form.state"

export const eventFormSteps = [
    "basics",
    "place-and-time",
    "photos",
    "details",
    "review",
] as const
export type EventFormStep = (typeof eventFormSteps)[number]

export const EVENT_FORM_STEP_FIELDS: Record<
    EventFormStep,
    ReadonlyArray<keyof EventFormState>
> = {
    basics: ["title", "description", "categoryIds", "primaryCategoryId", "organizer"],
    "place-and-time": [
        "venue",
        "startDate",
        "startTime",
        "endDate",
        "endTime",
        "repeat",
        "weekdays",
        "monthlyMode",
        "until",
        "addedDates",
        "removedDates",
    ],
    photos: ["photos"],
    details: ["priceScheme", "capacity", "instagramUrl", "facebookUrl"],
    review: [],
}

/**
 * @description Returns the completion of a step: complete with no error on its fields,
 * partial with an error and a filled field, else not started
 * @param step Step read
 * @param state Event form state
 * @param errors Errors of the event form conversion
 * @remarks Reads the review as not started, since only the save completes it
 */
export const eventFormStepCompletion = (
    step: EventFormStep,
    state: EventFormState,
    errors: FormErrors<EventFormState> | undefined,
): StepCompletion => {
    if (step === "review") {
        return false
    }
    const fields = EVENT_FORM_STEP_FIELDS[step]
    if (!fields.some(field => errors?.[field] !== undefined)) {
        return true
    }
    return fields.some(field => state[field] !== undefined) ? "partially" : false
}

/**
 * @description True when the user can open the step from the current one: any earlier step,
 * or a later step once every step before it is complete
 * @param step Step opened
 * @param currentStep Step shown
 * @param completionOf Completion of each step
 */
export const isEventFormStepEnabled = (
    step: EventFormStep,
    currentStep: EventFormStep,
    completionOf: (step: EventFormStep) => StepCompletion,
): boolean => {
    const target = eventFormSteps.indexOf(step)
    return (
        target <= eventFormSteps.indexOf(currentStep) ||
        eventFormSteps.slice(0, target).every(before => completionOf(before) === true)
    )
}
