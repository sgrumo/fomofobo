import type { CustomErrorCode } from "models"
import type { Result } from "shared/result"
import type {
    ZodInvalidTypeExpected,
    ZodLengthOrigin,
    ZodNumericOrigin,
    ZodStringFormat,
} from "shared/zod"
import type { $ZodErrorTree } from "zod/v4/core"

//#region forms
/**
 * @description Returns the member of a discriminated action union carrying the given `type`
 * @template A Union discriminated on `type`
 * @template T Discriminant selected
 */
export type Action<A extends { type: unknown }, T extends A["type"]> = Extract<
    A,
    { type: T }
>
/**
 * @description Returns the per-field error trees of a form state
 * @template T Form state type
 */
export type FormErrors<T extends object> = {
    [K in keyof T]?: $ZodErrorTree<T[K]>
}
/**
 * @description Returns the result of a form conversion, holding the output or the per-field errors
 * @template T Form state type
 * @template U Conversion output type
 */
export type FormResult<T extends object, U> = Result<U, FormErrors<T>>
type FormErrorSizeLeaf =
    | "Default"
    | `${ZodLengthOrigin}.${"Inclusive" | "Exact"}`
    | `${ZodNumericOrigin}.${"Inclusive" | "Exclusive"}`
export type FormErrorKey =
    | "FormErrors.Required"
    | `FormErrors.InvalidType.${ZodInvalidTypeExpected | "Default"}`
    | `FormErrors.TooSmall.${FormErrorSizeLeaf}`
    | `FormErrors.TooBig.${FormErrorSizeLeaf}`
    | `FormErrors.InvalidFormat.${ZodStringFormat | "Default"}`
    | "FormErrors.InvalidValue"
    | "FormErrors.NotMultipleOf"
    | "FormErrors.UnrecognizedKeys"
export type FormCustomErrorKey = `FormErrors.Custom.${CustomErrorCode}`
export type FormIssueKey = FormErrorKey | FormCustomErrorKey
export type FormErrorParams = Record<string, string | number | boolean | undefined>
export interface FormErrorTranslator {
    exists: (key: FormIssueKey, params: FormErrorParams) => boolean
    translate: (key: FormIssueKey, params: FormErrorParams) => string
}
//#endregion
