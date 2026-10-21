"use client"

import { identity } from "es-toolkit"
import type { FormErrors } from "frontend-shared/types"
import { categoryIconValues } from "models"
import { useTranslation } from "react-i18next"
import { Field } from "ui-components/field"
import { PixelIcon } from "ui-components/pixel-icons"
import { Select } from "ui-components/select"
import { StringInput } from "ui-components/string-input"

import type { CategoryFormAction, CategoryFormState } from "./category-form.state"
import { categoryFormReducer } from "./category-form.state"

interface CategoryFormProps {
    value: CategoryFormState
    onValueChange: (value: CategoryFormState) => void
    errors: FormErrors<CategoryFormState> | undefined
    disabled?: boolean
}

export const CategoryForm = (props: CategoryFormProps) => {
    const { t } = useTranslation("shared")

    const onAction = (action: CategoryFormAction) => {
        props.onValueChange(categoryFormReducer(props.value, action))
    }

    return (
        <>
            <Field
                label={t("Backoffice.CategoryForm.Name")}
                required={true}
                errors={props.errors?.name?.errors}
            >
                <StringInput
                    value={props.value.name}
                    onValueChange={name => {
                        onAction({ type: "name", value: name })
                    }}
                    disabled={props.disabled}
                />
            </Field>
            {/* PLACEHOLDER(TQ-05): the fixed pixel icon set */}
            <Field
                label={t("Backoffice.CategoryForm.Icon")}
                required={true}
                errors={props.errors?.icon?.errors}
            >
                <Select
                    multiple={false}
                    resettable={false}
                    items={[...categoryIconValues]}
                    getItemId={identity}
                    renderItem={({ item }) => (
                        <span className="flex items-center gap-2">
                            <PixelIcon name={item} className="size-4" />
                            {t(`Backoffice.CategoryForm.Icons.${item}`)}
                        </span>
                    )}
                    value={props.value.icon}
                    onValueChange={icon => {
                        onAction({ type: "icon", value: icon })
                    }}
                    disabled={props.disabled}
                />
            </Field>
        </>
    )
}
