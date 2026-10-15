import { noop } from "es-toolkit"
import type { ReactNode } from "react"

import { Field } from "../field/field"
import { Form } from "../form/form"
import {
    fieldCallbacksError,
    fieldCallbacksLabel,
    fieldCallbacksSubmitLabel,
} from "./field-callbacks"

interface FieldCallbacksFormProps {
    children?: ReactNode
}
/**
 * @remarks Shows the field error only when the field records agree with the form submission
 */
export const FieldCallbacksForm = (props: FieldCallbacksFormProps) => (
    <Form mode="edit" onSubmit={noop} noValidate={false}>
        <Field
            label={fieldCallbacksLabel}
            required={false}
            errors={[fieldCallbacksError]}
        >
            {props.children}
        </Field>
        <button type="submit">{fieldCallbacksSubmitLabel}</button>
    </Form>
)
