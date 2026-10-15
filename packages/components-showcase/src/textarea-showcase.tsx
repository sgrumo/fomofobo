import { noop } from "es-toolkit"
import { cn } from "frontend-shared/styles"
import { useState } from "react"
import { Field } from "ui-components/field"
import { Form } from "ui-components/form"
import { Textarea } from "ui-components/textarea"

interface TextareaShowcaseProps {
    className?: string
}
export const TextareaShowcase = (props: TextareaShowcaseProps) => {
    const [textareas, setTextareas] = useState<Partial<Record<string, string>>>({})
    const textareaValue = (key: string) => textareas[key]
    const textareaOnValueChange = (key: string) => (value: string | undefined) => {
        setTextareas(prev => ({
            ...prev,
            [key]: value,
        }))
    }

    return (
        <Form
            noValidate={false}
            mode="edit"
            onSubmit={noop}
            className={cn(
                "grid w-full grid-cols-[repeat(auto-fit,minmax(min(100%,18rem),18rem))] justify-center gap-4",
                props.className,
            )}
        >
            <Field label="Textarea" required={true}>
                <Textarea
                    value={textareaValue("t1")}
                    onValueChange={textareaOnValueChange("t1")}
                    placeholder="Write something..."
                    className="w-full"
                />
            </Field>
            <Field label="Disabled Textarea" disabled={true} required={false}>
                <Textarea
                    value="Cannot edit this content"
                    onValueChange={textareaOnValueChange("t2")}
                    className="w-full"
                />
            </Field>
            <Field
                label="Error Textarea"
                errors={["Message is too short"]}
                required={false}
            >
                <Textarea
                    value={textareaValue("t3")}
                    onValueChange={textareaOnValueChange("t3")}
                    className="w-full"
                />
            </Field>
            <Field
                label="With Description"
                description="Describe the issue in detail; this text is announced by screen readers."
                required={false}
            >
                <Textarea
                    value={textareaValue("t4")}
                    onValueChange={textareaOnValueChange("t4")}
                    className="w-full"
                />
            </Field>
        </Form>
    )
}
