import { mapValues, noop } from "es-toolkit"
import { useForm } from "react-shared"
import { match } from "ts-pattern"
import { Button } from "ui-components/button"
import { DateInput } from "ui-components/date-input"
import { Field } from "ui-components/field"
import { Form } from "ui-components/form"
import { NumberInput } from "ui-components/number-input"
import { StringInput } from "ui-components/string-input"
import { useToast } from "ui-components/toast"

import type { FormStateParser } from "./components-showcase.helper"
import type { FormErrorsShowcaseValue } from "./form-errors-showcase.helper"
import {
    formErrorsShowcaseMessages,
    formErrorsShowcaseStateToOutput,
    initialFormErrorsShowcaseState,
} from "./form-errors-showcase.helper"

const keyPrefix = "FormErrors."
const readonlyDescription =
    "This value has no single-input control. The field shows a fixed sample value that is validated on submit, so only the error is shown here."

interface FormErrorsShowcaseProps {
    parseFormState: FormStateParser
}

export const FormErrorsShowcase = (props: FormErrorsShowcaseProps) => {
    const toast = useToast()
    const { formId, form, setForm, errors, convert } = useForm(
        initialFormErrorsShowcaseState,
        formErrorsShowcaseStateToOutput,
        props.parseFormState,
    )
    const messages = formErrorsShowcaseMessages(errors)

    const handleSubmit = () => {
        const result = convert(form)
        if (!result.success) {
            toast.add("form-validation-error")
            return
        }
        toast.addPlain("success", "Every field is valid.")
    }

    return (
        <div className="flex w-full flex-col items-center gap-6">
            <Form
                mode="edit"
                id={formId}
                noValidate={true}
                onSubmit={handleSubmit}
                className="grid w-full grid-cols-1 items-start gap-x-8 gap-y-6 lg:grid-cols-2"
            >
                {Object.entries(form).map(([key, value]) => (
                    <FormErrorsShowcaseField
                        key={key}
                        name={key}
                        value={value}
                        errors={messages.get(key)}
                        onValueChange={next => {
                            setForm(
                                mapValues(form, (current, currentKey) =>
                                    currentKey === key ? next : current,
                                ),
                            )
                        }}
                    />
                ))}
            </Form>
            <Button variant="primary" size="md" type="submit" form={formId}>
                Submit to show errors
            </Button>
        </div>
    )
}

interface FormErrorsShowcaseFieldProps {
    name: string
    value: FormErrorsShowcaseValue
    errors: string[] | undefined
    onValueChange: (value: FormErrorsShowcaseValue) => void
}

const FormErrorsShowcaseField = (props: FormErrorsShowcaseFieldProps) => {
    const readonly = props.value.control === "readonly"
    const input = match(props.value)
        .with({ control: "string" }, value => (
            <StringInput
                value={value.value}
                onValueChange={next => {
                    props.onValueChange({ ...value, value: next })
                }}
                className="w-full"
            />
        ))
        .with({ control: "number" }, value => (
            <NumberInput
                size="md"
                value={value.value}
                onValueChange={next => {
                    props.onValueChange({ ...value, value: next })
                }}
                className="w-full"
            />
        ))
        .with({ control: "date" }, value => (
            <DateInput
                value={value.value}
                onValueChange={next => {
                    props.onValueChange({ ...value, value: next })
                }}
            />
        ))
        .with({ control: "readonly" }, value => (
            <StringInput value={value.display} onValueChange={noop} className="w-full" />
        ))
        .exhaustive()

    return (
        <Field
            label={props.name.slice(keyPrefix.length)}
            required={props.name === "FormErrors.Required"}
            description={readonly ? readonlyDescription : undefined}
            disabled={readonly}
            dimDisabled={false}
            errors={props.errors}
        >
            {input}
        </Field>
    )
}
