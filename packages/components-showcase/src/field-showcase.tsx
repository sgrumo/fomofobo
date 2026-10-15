import { noop } from "es-toolkit"
import { cn } from "frontend-shared/styles"
import { useState } from "react"
import { Button } from "ui-components/button"
import { Field } from "ui-components/field"
import { Form } from "ui-components/form"
import { StringInput } from "ui-components/string-input"
import { Switch } from "ui-components/switch"

interface FieldShowcaseProps {
    className?: string
}
export const FieldShowcase = (props: FieldShowcaseProps) => {
    const [values, setValues] = useState<Partial<Record<string, string>>>({})
    const value = (key: string) => values[key]
    const onValueChange = (key: string) => (next: string | undefined) => {
        setValues(prev => ({ ...prev, [key]: next }))
    }
    const [switches, setSwitches] = useState<Partial<Record<string, boolean>>>({})
    const switchValue = (key: string) => switches[key] ?? false
    const switchOnValueChange = (key: string) => (next: boolean) => {
        setSwitches(prev => ({ ...prev, [key]: next }))
    }

    return (
        <Form
            noValidate={false}
            mode="edit"
            onSubmit={noop}
            className={cn("flex w-full flex-col items-center gap-6", props.className)}
        >
            <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(min(100%,18rem),18rem))] justify-center gap-4">
                <Field label="Required" required={true}>
                    <StringInput
                        value={value("required")}
                        onValueChange={onValueChange("required")}
                        className="w-full"
                    />
                </Field>
                <Field label="Optional" required={false}>
                    <StringInput
                        value={value("optional")}
                        onValueChange={onValueChange("optional")}
                        className="w-full"
                    />
                </Field>
                <Field
                    label="With description"
                    description="The description is announced by screen readers and shown in a tooltip."
                    required={false}
                >
                    <StringInput
                        value={value("description")}
                        onValueChange={onValueChange("description")}
                        className="w-full"
                    />
                </Field>
                <Field label="Disabled (dimmed)" disabled={true} required={false}>
                    <StringInput
                        value="Cannot edit"
                        onValueChange={onValueChange("disabled")}
                        className="w-full"
                    />
                </Field>
                <Field
                    label="Disabled (not dimmed)"
                    disabled={true}
                    dimDisabled={false}
                    required={false}
                >
                    <StringInput
                        value="Cannot edit"
                        onValueChange={onValueChange("disabled-no-dim")}
                        className="w-full"
                    />
                </Field>
                <Field label="Screen reader only label" srOnly={true} required={false}>
                    <StringInput
                        value={value("sr-only")}
                        onValueChange={onValueChange("sr-only")}
                        placeholder="The label is visually hidden"
                        className="w-full"
                    />
                </Field>
                <Field label="Medium label" labelWeight="medium" required={false}>
                    <StringInput
                        value={value("medium")}
                        onValueChange={onValueChange("medium")}
                        className="w-full"
                    />
                </Field>
                <Field label="Semibold label" labelWeight="semibold" required={false}>
                    <StringInput
                        value={value("semibold")}
                        onValueChange={onValueChange("semibold")}
                        className="w-full"
                    />
                </Field>
                <Field label="Small gap" gap="sm" required={false}>
                    <StringInput
                        value={value("gap-sm")}
                        onValueChange={onValueChange("gap-sm")}
                        className="w-full"
                    />
                </Field>
                <Field label="Custom gap (1rem)" gap="1rem" required={false}>
                    <StringInput
                        value={value("gap-custom")}
                        onValueChange={onValueChange("gap-custom")}
                        className="w-full"
                    />
                </Field>
                <Field label="Label at the bottom" labelSide="bottom" required={false}>
                    <StringInput
                        value={value("bottom")}
                        onValueChange={onValueChange("bottom")}
                        className="w-full"
                    />
                </Field>
                <Field label="View mode" mode="view" required={false}>
                    <StringInput
                        value="Read only value"
                        onValueChange={onValueChange("view")}
                        className="w-full"
                    />
                </Field>
                <Field label="Label on the right" labelSide="right" required={false}>
                    <Switch
                        value={switchValue("right")}
                        onValueChange={switchOnValueChange("right")}
                    />
                </Field>
                <Field label="Label on the left" labelSide="left" required={false}>
                    <Switch
                        value={switchValue("left")}
                        onValueChange={switchOnValueChange("left")}
                    />
                </Field>
                <Field
                    label="Single error"
                    errors={["Username is taken"]}
                    required={true}
                >
                    <StringInput
                        value={value("single-error")}
                        onValueChange={onValueChange("single-error")}
                        className="w-full"
                    />
                </Field>
                <Field
                    label="Multiple errors"
                    errors={[
                        "Password is too short",
                        "Password needs a digit",
                        "Password needs a symbol",
                    ]}
                    required={true}
                >
                    <StringInput
                        value={value("multiple-errors")}
                        onValueChange={onValueChange("multiple-errors")}
                        className="w-full"
                    />
                </Field>
                <Field
                    label="Errors with description"
                    description="Errors and description share the accessible description."
                    errors={["Value is required", "Value must be unique"]}
                    required={true}
                >
                    <StringInput
                        value={value("errors-description")}
                        onValueChange={onValueChange("errors-description")}
                        className="w-full"
                    />
                </Field>
                <Field label="Empty errors array" errors={[]} required={false}>
                    <StringInput
                        value={value("empty-errors")}
                        onValueChange={onValueChange("empty-errors")}
                        className="w-full"
                    />
                </Field>
            </div>
            <Button variant="primary" size="md" type="submit">
                Submit to show errors
            </Button>
        </Form>
    )
}
