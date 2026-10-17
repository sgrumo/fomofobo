"use client"

import type { FormErrors } from "frontend-shared/types"
import { useTranslation } from "react-i18next"
import { Field } from "ui-components/field"
import { Textarea } from "ui-components/textarea"

import type { BlockEventFormAction, BlockEventFormState } from "./block-event-form.state"
import { blockEventFormReducer } from "./block-event-form.state"

interface BlockEventFormProps {
    value: BlockEventFormState
    onValueChange: (value: BlockEventFormState) => void
    errors: FormErrors<BlockEventFormState> | undefined
    disabled?: boolean
}

export const BlockEventForm = (props: BlockEventFormProps) => {
    const { t } = useTranslation("shared")

    const onAction = (action: BlockEventFormAction) => {
        props.onValueChange(blockEventFormReducer(props.value, action))
    }

    return (
        <Field
            label={t("Backoffice.Events.Block.Reason")}
            description={t("Backoffice.Events.Block.ReasonHint")}
            required={true}
            errors={props.errors?.reason?.errors}
        >
            <Textarea
                value={props.value.reason}
                onValueChange={value => {
                    onAction({ type: "reason", value })
                }}
                disabled={props.disabled}
            />
        </Field>
    )
}
