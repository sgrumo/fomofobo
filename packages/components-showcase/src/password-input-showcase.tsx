import { noop } from "es-toolkit"
import { cn } from "frontend-shared/styles"
import { useState } from "react"
import { Field } from "ui-components/field"
import { Form } from "ui-components/form"
import { PasswordInput } from "ui-components/password-input"

interface PasswordInputShowcaseProps {
    className?: string
}
export const PasswordInputShowcase = (props: PasswordInputShowcaseProps) => {
    const [passwordInputs, setPasswordInputs] = useState<Partial<Record<string, string>>>(
        {},
    )
    const passwordValue = (key: string) => passwordInputs[key]
    const setPasswordValue = (key: string) => (value: string | undefined) => {
        setPasswordInputs(prev => ({
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
            <Field label="Medium Password Input" required={true}>
                <PasswordInput
                    value={passwordValue("p1")}
                    onValueChange={setPasswordValue("p1")}
                    autoComplete="current-password"
                    size="md"
                    className="w-full"
                />
            </Field>
            <Field label="Small Password Input" required={true}>
                <PasswordInput
                    value={passwordValue("p2")}
                    onValueChange={setPasswordValue("p2")}
                    autoComplete="current-password"
                    size="sm"
                    className="w-full"
                />
            </Field>
            <Field label="Medium Password Input (Forbid Show)" required={true}>
                <PasswordInput
                    value={passwordValue("p3")}
                    onValueChange={setPasswordValue("p3")}
                    autoComplete="current-password"
                    allowShow={false}
                    size="md"
                    className="w-full"
                />
            </Field>
            <Field label="Small Password Input (Forbid Show)" required={true}>
                <PasswordInput
                    value={passwordValue("p4")}
                    onValueChange={setPasswordValue("p4")}
                    autoComplete="current-password"
                    allowShow={false}
                    size="sm"
                    className="w-full"
                />
            </Field>
            <Field
                label="With Description"
                description="Must be at least 12 characters with a number and a symbol."
                required={true}
            >
                <PasswordInput
                    value={passwordValue("p5")}
                    onValueChange={setPasswordValue("p5")}
                    autoComplete="new-password"
                    size="md"
                    className="w-full"
                />
            </Field>
        </Form>
    )
}
