import { noop } from "es-toolkit"
import { cn } from "frontend-shared/styles"
import { useState } from "react"
import { Field } from "ui-components/field"
import { Form } from "ui-components/form"
import { OtpInput } from "ui-components/otp-input"

interface OtpInputShowcaseProps {
    className?: string
}
export const OtpInputShowcase = (props: OtpInputShowcaseProps) => {
    const [otpInputs, setOtpInputs] = useState<Partial<Record<string, string>>>({})
    const otpValue = (key: string) => otpInputs[key]
    const setOtpValue = (key: string) => (value: string | undefined) => {
        setOtpInputs(prev => ({
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
            <Field label="Medium OTP Input" required={true}>
                <OtpInput
                    length={6}
                    value={otpValue("o1")}
                    onValueChange={setOtpValue("o1")}
                    size="md"
                />
            </Field>
            <Field label="Small OTP Input" required={true}>
                <OtpInput
                    length={6}
                    value={otpValue("o2")}
                    onValueChange={setOtpValue("o2")}
                    size="sm"
                />
            </Field>
            <Field label="Grouped OTP Input" required={false}>
                <OtpInput
                    length={6}
                    groupSize={3}
                    value={otpValue("o3")}
                    onValueChange={setOtpValue("o3")}
                    size="md"
                />
            </Field>
            <Field label="Masked OTP Input" required={false}>
                <OtpInput
                    length={4}
                    mask={true}
                    value={otpValue("o4")}
                    onValueChange={setOtpValue("o4")}
                    size="md"
                />
            </Field>
            <Field label="Alphanumeric OTP Input" required={false}>
                <OtpInput
                    length={5}
                    validationType="alphanumeric"
                    value={otpValue("o5")}
                    onValueChange={setOtpValue("o5")}
                    size="md"
                />
            </Field>
            <Field label="Disabled OTP Input" disabled={true} required={false}>
                <OtpInput length={4} value="1234" onValueChange={noop} size="md" />
            </Field>
            <Field
                label="Error OTP Input"
                errors={["Code is not valid"]}
                required={false}
            >
                <OtpInput
                    length={4}
                    value={otpValue("o7")}
                    onValueChange={setOtpValue("o7")}
                    size="md"
                />
            </Field>
            <Field
                label="OTP With Description"
                description="Enter the 6 digit code we sent to your phone."
                required={true}
            >
                <OtpInput
                    length={6}
                    value={otpValue("o8")}
                    onValueChange={setOtpValue("o8")}
                    size="md"
                />
            </Field>
            <Field label="View OTP Input" mode="view" required={false}>
                <OtpInput length={6} value="123456" onValueChange={noop} size="md" />
            </Field>
        </Form>
    )
}
