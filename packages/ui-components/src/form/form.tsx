import { useState } from "react"
import type { Require } from "shared/types"

import type { FormMode } from "./form.context"
import { FormContext } from "./form.context"

interface FormProps extends Require<
    React.ComponentProps<"form">,
    "onSubmit" | "noValidate"
> {
    mode: FormMode
    preventDefault?: boolean
}
export const Form = ({
    mode,
    preventDefault = true,
    onSubmit: propOnSubmit,
    ...props
}: FormProps) => {
    const [submittedAt, setSubmittedAt] = useState<Date | null>(null)

    const onSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
        if (preventDefault) {
            event.preventDefault()
        }

        propOnSubmit(event)
        setSubmittedAt(new Date())
    }

    return (
        <FormContext value={{ mode, submittedAt }}>
            <form {...props} onSubmit={onSubmit} />
        </FormContext>
    )
}
