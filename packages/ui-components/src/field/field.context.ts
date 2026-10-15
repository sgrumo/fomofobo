import type { FocusEvent, ReactNode } from "react"
import { createContext, useContext } from "react"
import { isDefined } from "shared/values"

import type { FormMode } from "../form/form.context"
import { useFormContext } from "../form/form.context"

export interface FieldContext {
    inputId: string
    labelId: string
    label: ReactNode
    describedByIds: string | undefined
    required: boolean
    disabled: boolean
    errors: string[] | undefined
    mode: FormMode
    formSubmittedAt: Date | null
    changedAt: Date | null
    setChangedAt: (date: Date | null) => void
    blurredAt: Date | null
    setBlurredAt: (date: Date | null) => void
}

export const FieldContext = createContext<FieldContext | null>(null)
export const useFieldContext = () => useContext(FieldContext)

/**
 * @description Returns the mode of the closest field, of the closest form, or `edit`
 */
export const useFieldInputMode = (): FormMode => {
    const formContext = useFormContext()
    const fieldContext = useFieldContext()
    return fieldContext?.mode ?? formContext?.mode ?? "edit"
}

export interface FieldCallbacks {
    onChange: () => void
    onBlur: (event?: FocusEvent<HTMLElement>) => void
}

/**
 * @description Returns the callbacks that record the change time and the blur time on the closest field
 * @param suppressed Stops every record when true
 * @remarks Skips a blur that keeps the focus inside the event target
 */
export const useFieldCallbacks = (suppressed = false): FieldCallbacks => {
    const fieldContext = useFieldContext()
    const active = !suppressed && isDefined(fieldContext)

    return {
        onChange: () => {
            if (!active) {
                return
            }

            fieldContext.setChangedAt(new Date())
        },
        onBlur: event => {
            if (!active) {
                return
            }

            if (isDefined(event) && event.currentTarget.contains(event.relatedTarget)) {
                return
            }

            fieldContext.setBlurredAt(new Date())
        },
    }
}
