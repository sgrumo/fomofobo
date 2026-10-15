import type { FormErrors, FormResult } from "frontend-shared/types"
import type { Dispatch, SetStateAction } from "react"
import { useId, useState } from "react"

export interface UseForm<T extends object, U> {
    formId: string
    form: T
    setForm: Dispatch<SetStateAction<T>>
    errors: FormErrors<T> | undefined
    convert: (form: T) => FormResult<T, U>
}

/**
 * @description Returns the form state, its setter, a form id, and the live conversion errors
 * @template T Form state type
 * @template U Conversion output type
 * @template A Arguments forwarded to the conversion
 * @param initialValue Initial state, or a factory yielding it
 * @param convert Conversion validating the state and mapping it to the output
 * @param convertArgs Arguments appended to every conversion call, such as the language
 * @remarks Reruns the conversion when the state or a convert argument changes, so `errors` follows both
 */
export const useForm = <T extends object, U, const A extends unknown[]>(
    initialValue: T | (() => T),
    convert: (form: T, ...args: A) => FormResult<T, U>,
    ...convertArgs: A
): UseForm<T, U> => {
    const formId = useId()
    const [form, setForm] = useState(initialValue)
    const boundConvert = (value: T) => convert(value, ...convertArgs)
    const result = boundConvert(form)
    const errors = result.success ? undefined : result.error

    return { formId, form, setForm, errors, convert: boundConvert }
}
