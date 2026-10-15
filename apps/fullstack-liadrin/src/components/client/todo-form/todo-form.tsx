"use client"

import type { FormErrors } from "frontend-shared/types"
import { useTranslation } from "react-i18next"
import { Checkbox } from "ui-components/checkbox"
import { DateInput } from "ui-components/date-input"
import { Field } from "ui-components/field"
import { StringInput } from "ui-components/string-input"
import { Textarea } from "ui-components/textarea"

import type { TodoFormAction, TodoFormState } from "./todo-form.state"
import { todoFormReducer } from "./todo-form.state"

interface TodoFormProps {
    value: TodoFormState
    onValueChange: (value: TodoFormState) => void
    errors: FormErrors<TodoFormState> | undefined
    intent: "create" | "update"
}

export const TodoForm = (props: TodoFormProps) => {
    const { t } = useTranslation("shared")

    const onAction = (action: TodoFormAction) => {
        props.onValueChange(todoFormReducer(props.value, action))
    }

    return (
        <>
            <Field
                label={t("Todos.Fields.Title")}
                required={true}
                errors={props.errors?.title?.errors}
            >
                <StringInput
                    value={props.value.title}
                    onValueChange={value => {
                        onAction({ type: "title", value })
                    }}
                />
            </Field>
            <Field
                label={t("Todos.Fields.Description")}
                required={false}
                errors={props.errors?.description?.errors}
            >
                <Textarea
                    value={props.value.description}
                    onValueChange={value => {
                        onAction({ type: "description", value })
                    }}
                    rows={4}
                />
            </Field>
            <Field
                label={t("Todos.Fields.EndDate")}
                required={false}
                errors={props.errors?.endDate?.errors}
            >
                <DateInput
                    value={props.value.endDate}
                    onValueChange={value => {
                        onAction({ type: "end-date", value })
                    }}
                />
            </Field>
            {props.intent === "update" && (
                <Field
                    label={t("Todos.Fields.Completed")}
                    labelSide="right"
                    required={false}
                    errors={props.errors?.completed?.errors}
                >
                    <Checkbox
                        value={props.value.completed ?? false}
                        onValueChange={value => {
                            onAction({ type: "completed", value })
                        }}
                    />
                </Field>
            )}
        </>
    )
}
