"use client"

import type { Category } from "models"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { match } from "ts-pattern"
import { Button } from "ui-components/button"
import { Form } from "ui-components/form"
import { StatGrid } from "ui-components/stat-grid"
import { Stepper } from "ui-components/stepper"

import type { EventFormProps } from "@/components/client/event-form/event-form"
import {
    EventBasicsSection,
    EventDetailsSection,
    EventPhotosSection,
    EventScheduleSection,
} from "@/components/client/event-form/event-form"
import type { EventFormState } from "@/components/client/event-form/event-form.state"
import { localDateTimeOf } from "@/components/client/event-form/event-form.state"
import { formatLocalDateTime } from "@/lib/events/local-format"
import { FREE_PRICE_SCHEME } from "@/lib/events/price-summary"
import { usePriceSummary } from "@/lib/hooks/use-price-summary"

import type { EventFormStep } from "./event-form-wizard.steps"
import {
    eventFormStepCompletion,
    eventFormSteps,
    isEventFormStepEnabled,
} from "./event-form-wizard.steps"

interface EventFormWizardProps extends EventFormProps {
    saving: boolean
    onSave: () => void
}

export const EventFormWizard = (props: EventFormWizardProps) => {
    const { t } = useTranslation("shared")
    const [step, setStep] = useState<EventFormStep>("basics")
    const index = eventFormSteps.indexOf(step)
    const previous = eventFormSteps[index - 1]
    const next = eventFormSteps[index + 1]

    const completionOf = (target: EventFormStep) =>
        eventFormStepCompletion(target, props.value, props.errors)

    const section = match(step)
        .with("basics", () => (
            <EventBasicsSection
                value={props.value}
                onValueChange={props.onValueChange}
                errors={props.errors}
                categories={props.categories}
                organizers={props.organizers}
                disabled={props.disabled}
            />
        ))
        .with("place-and-time", () => (
            <EventScheduleSection
                value={props.value}
                onValueChange={props.onValueChange}
                errors={props.errors}
                venues={props.venues}
                disabled={props.disabled}
            />
        ))
        .with("photos", () => (
            <EventPhotosSection
                photos={props.value.photos}
                onPhotosChange={props.onPhotosChange}
                errors={props.errors}
                disabled={props.disabled}
            />
        ))
        .with("details", () => (
            <EventDetailsSection
                value={props.value}
                onValueChange={props.onValueChange}
                errors={props.errors}
                disabled={props.disabled}
            />
        ))
        .with("review", () => (
            <EventReview
                value={props.value}
                categories={props.categories}
                showOrganizer={props.organizers !== undefined}
            />
        ))
        .exhaustive()

    return (
        <div className="flex flex-col gap-4">
            <Stepper
                steps={eventFormSteps.map(id => ({
                    id,
                    label: t(`Backoffice.EventWizard.Steps.${id}`),
                }))}
                currentStep={step}
                isStepEnabled={target =>
                    isEventFormStepEnabled(target.id, step, completionOf)
                }
                isStepCompleted={target => completionOf(target.id)}
                getStepNumber={target => eventFormSteps.indexOf(target.id) + 1}
                onStepClick={target => {
                    setStep(target.id)
                }}
            />
            {/* One form per step: its submit reveals the errors of this step alone. */}
            <Form
                key={step}
                mode="edit"
                noValidate={true}
                onSubmit={() => {
                    if (next === undefined) {
                        props.onSave()
                        return
                    }
                    if (completionOf(step) === true) {
                        setStep(next)
                    }
                }}
                className="flex flex-col gap-4"
            >
                {section}
                <div className="flex flex-wrap gap-2">
                    {previous === undefined ? undefined : (
                        <Button
                            variant="secondary"
                            size="md"
                            disabled={props.disabled}
                            onClick={() => {
                                setStep(previous)
                            }}
                        >
                            {t("Backoffice.EventWizard.Back")}
                        </Button>
                    )}
                    <Button
                        variant="primary"
                        size="md"
                        type="submit"
                        loading={next === undefined && props.saving}
                    >
                        {next === undefined
                            ? t("Backoffice.Actions.Save")
                            : t("Backoffice.EventWizard.Next")}
                    </Button>
                </div>
            </Form>
        </div>
    )
}

interface EventReviewProps {
    value: EventFormState
    categories: Category[]
    showOrganizer: boolean
}

const EventReview = (props: EventReviewProps) => {
    const { t } = useTranslation("shared")
    const priceSummary = usePriceSummary()
    const value = props.value
    const startsAt = localDateTimeOf(value.startDate, value.startTime)
    const endsAt = localDateTimeOf(value.endDate, value.endTime)

    const items = [
        { label: t("Backoffice.EventForm.Title"), value: value.title },
        {
            label: t("Backoffice.EventForm.Categories"),
            value: props.categories
                .filter(category => (value.categoryIds ?? []).includes(category.id))
                .map(category => category.name)
                .join(", "),
        },
        {
            label: t("Backoffice.EventForm.Organizer"),
            value: props.showOrganizer ? value.organizer?.name : undefined,
        },
        { label: t("Backoffice.EventForm.Venue"), value: value.venue?.name },
        {
            label: t("Backoffice.EventWizard.Start"),
            value: startsAt === undefined ? undefined : formatLocalDateTime(startsAt),
        },
        {
            label: t("Backoffice.EventWizard.End"),
            value: endsAt === undefined ? undefined : formatLocalDateTime(endsAt),
        },
        {
            label: t("Backoffice.EventForm.Repeat"),
            value: t(`Backoffice.EventForm.Repeats.${value.repeat ?? "single"}`),
        },
        {
            label: t("Backoffice.Photos.Label"),
            value: t("Backoffice.EventWizard.PhotoCount", {
                count: value.photos?.length ?? 0,
            }),
        },
        {
            label: t("Backoffice.EventForm.Price"),
            value: priceSummary(value.priceScheme ?? FREE_PRICE_SCHEME),
        },
        { label: t("Backoffice.EventForm.Instagram"), value: value.instagramUrl },
        { label: t("Backoffice.EventForm.Facebook"), value: value.facebookUrl },
    ].filter(item => item.value !== undefined)

    return (
        <section aria-label={t("Backoffice.EventWizard.Steps.review")}>
            <StatGrid items={items} />
        </section>
    )
}
