import { describe, expect, it } from "vitest"

import { initialEventFormState } from "@/components/client/event-form/event-form.state"

import {
    EVENT_FORM_STEP_FIELDS,
    eventFormStepCompletion,
    eventFormSteps,
    isEventFormStepEnabled,
} from "./event-form-wizard.steps"

describe("EVENT_FORM_STEP_FIELDS", () => {
    it("puts each field of the form in one step", () => {
        const fields = eventFormSteps.flatMap(step => EVENT_FORM_STEP_FIELDS[step])

        expect(fields.toSorted()).toStrictEqual(
            Object.keys(initialEventFormState()).toSorted(),
        )
    })
})

describe("eventFormStepCompletion", () => {
    const required = { errors: ["Obbligatorio"] }

    it("reads a step with no error as complete", () => {
        expect(
            eventFormStepCompletion("details", initialEventFormState(), {
                title: required,
            }),
        ).toBe(true)
    })

    it("reads a step with an error as partial once a field holds a value", () => {
        const state = { ...initialEventFormState(), description: "Jazz in the cloister" }

        expect(eventFormStepCompletion("basics", state, { title: required })).toBe(
            "partially",
        )
        expect(
            eventFormStepCompletion("basics", initialEventFormState(), {
                title: required,
            }),
        ).toBe(false)
    })

    it("reads the review as not started", () => {
        expect(
            eventFormStepCompletion("review", initialEventFormState(), undefined),
        ).toBe(false)
    })
})

describe("isEventFormStepEnabled", () => {
    const completions = {
        basics: true,
        "place-and-time": false,
        photos: false,
        details: true,
        review: false,
    } as const

    it("opens any earlier step", () => {
        expect(
            isEventFormStepEnabled("basics", "photos", step => completions[step]),
        ).toBe(true)
    })

    it("opens a later step only once every step before it is complete", () => {
        expect(
            isEventFormStepEnabled("place-and-time", "basics", step => completions[step]),
        ).toBe(true)
        expect(
            isEventFormStepEnabled("photos", "basics", step => completions[step]),
        ).toBe(false)
        expect(
            isEventFormStepEnabled(
                "details",
                "place-and-time",
                step => completions[step],
            ),
        ).toBe(false)
    })
})
