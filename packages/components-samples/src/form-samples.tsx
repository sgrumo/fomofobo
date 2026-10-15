import { noop } from "es-toolkit"
import { useState } from "react"
import { Button } from "ui-components/button"
import { Checkbox } from "ui-components/checkbox"
import type { CheckboxState } from "ui-components/checkbox"
import { Field } from "ui-components/field"
import { Form } from "ui-components/form"
import { StringInput } from "ui-components/string-input"

export const FormSamples = () => {
    const [mode, setMode] = useState<"edit" | "view">("view")
    const [stringValue, setStringValue] = useState<string | undefined>(
        "View string value",
    )
    const [checkboxValue, setCheckboxValue] = useState<CheckboxState>(true)
    const [describedValue, setDescribedValue] = useState<string | undefined>(undefined)

    return (
        <div className="flex flex-col items-start gap-4">
            <Button
                variant="secondary"
                size="md"
                type="button"
                onClick={() => {
                    setMode(current => (current === "edit" ? "view" : "edit"))
                }}
            >
                Toggle form mode
            </Button>
            <Form
                noValidate={false}
                mode={mode}
                onSubmit={noop}
                className="flex w-full max-w-[18rem] flex-col gap-4"
            >
                <Field label="View String" required={false}>
                    <StringInput
                        value={stringValue}
                        onValueChange={setStringValue}
                        className="w-full"
                    />
                </Field>
                <Field label="View Checkbox" labelSide="right" required={false}>
                    <Checkbox value={checkboxValue} onValueChange={setCheckboxValue} />
                </Field>
                <Field
                    label="Described Input"
                    description="Described input help text"
                    required={false}
                >
                    <StringInput
                        value={describedValue}
                        onValueChange={setDescribedValue}
                        className="w-full"
                    />
                </Field>
            </Form>
        </div>
    )
}
