"use client"

import { identity } from "es-toolkit"
import type { FormErrors } from "frontend-shared/types"
import type { Category } from "models"
import { venueKindValues } from "models"
import { useTranslation } from "react-i18next"
import { Field } from "ui-components/field"
import { Select } from "ui-components/select"
import { StringInput } from "ui-components/string-input"

import type { VenueKindFormAction, VenueKindFormState } from "./venue-kind-form.state"
import { venueKindFormReducer } from "./venue-kind-form.state"

interface VenueKindFormProps {
    value: VenueKindFormState
    onValueChange: (value: VenueKindFormState) => void
    errors: FormErrors<VenueKindFormState> | undefined
    categories: Category[]
    disabled: boolean
}

export const VenueKindForm = (props: VenueKindFormProps) => {
    const { t } = useTranslation("shared")
    const onAction = (action: VenueKindFormAction) => {
        props.onValueChange(venueKindFormReducer(props.value, action))
    }
    const permanent = props.value.kind !== undefined && props.value.kind !== "regular"

    return (
        <>
            <Field
                label={t("Backoffice.VenueKindForm.Kind")}
                description={t("Backoffice.VenueKindForm.KindHint")}
                required={true}
                errors={props.errors?.kind?.errors}
            >
                <Select
                    multiple={false}
                    resettable={false}
                    items={[...venueKindValues]}
                    getItemId={identity}
                    renderItem={({ item }) => t(`VenueKind.${item}`)}
                    value={props.value.kind}
                    onValueChange={kind => {
                        onAction({ type: "kind", value: kind })
                    }}
                    disabled={props.disabled}
                />
            </Field>
            {permanent && (
                <>
                    <Field
                        label={t("Backoffice.VenueKindForm.ProgrammeUrl")}
                        required={true}
                        errors={props.errors?.programmeUrl?.errors}
                    >
                        <StringInput
                            value={props.value.programmeUrl}
                            onValueChange={programmeUrl => {
                                onAction({ type: "programme-url", value: programmeUrl })
                            }}
                            disabled={props.disabled}
                        />
                    </Field>
                    <Field
                        label={t("Backoffice.VenueKindForm.Category")}
                        description={t("Backoffice.VenueKindForm.CategoryHint")}
                        required={true}
                        errors={props.errors?.categoryId?.errors}
                    >
                        <Select
                            multiple={false}
                            resettable={false}
                            items={props.categories}
                            getItemId={category => category.id}
                            renderItem={({ item }) => item.name}
                            value={props.categories.find(
                                category => category.id === props.value.categoryId,
                            )}
                            onValueChange={category => {
                                onAction({ type: "category-id", value: category?.id })
                            }}
                            disabled={props.disabled}
                        />
                    </Field>
                </>
            )}
        </>
    )
}
