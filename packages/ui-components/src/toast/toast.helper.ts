import { Toast as ToastPrimitive } from "@base-ui/react"
import type { ToastManager as BaseToastManager } from "@base-ui/react"
import { uid } from "frontend-shared/random"
import { match, P } from "ts-pattern"
import type { ZodError } from "zod"
import { z } from "zod"

import type { UiTranslate } from "../i18n/ui-translations"

export interface NewInfoToast {
    type: "info"
    title: string
    messages?: string[]
}

export interface NewSuccessToast {
    type: "success"
    messages: [string, ...string[]]
}

export interface NewWarningToast {
    type: "warning"
    messages: [string, ...string[]]
}

interface NewErrorToastGenericError {
    type: "generic"
    messages?: string[]
}

interface NewErrorToastApiKnownError {
    type: "api"
    unknown: false
    status: number
    messages?: string[]
}

interface NewErrorToastApiUnknownError {
    type: "api"
    unknown: true
}

type NewErrorToastApiError = NewErrorToastApiKnownError | NewErrorToastApiUnknownError

interface NewErrorToastApiValidationError {
    type: "api-validation"
    zodError: ZodError
}

export interface NewErrorToast {
    type: "error"
    error:
        | NewErrorToastGenericError
        | NewErrorToastApiError
        | NewErrorToastApiValidationError
}

export type NewToast = NewInfoToast | NewSuccessToast | NewWarningToast | NewErrorToast

export const toastTypeSchema = z.enum(["info", "success", "warning", "error"])
export type ToastType = z.infer<typeof toastTypeSchema>

export const toastDescriptionItemSchema = z.object({
    id: z.string(),
    style: z.enum(["standard", "mono"]),
    value: z.string(),
})
export type ToastDescriptionItem = z.infer<typeof toastDescriptionItemSchema>

export const toastDataSchema = z.object({
    type: toastTypeSchema,
    title: z.string(),
    description: z.array(toastDescriptionItemSchema),
})
export type ToastData = z.infer<typeof toastDataSchema>

/**
 * @description Returns the title of the new toast
 * @param newToast Toast described
 * @param t Translate function
 */
const getNewToastTitle = (newToast: NewToast, t: UiTranslate): string =>
    match(newToast)
        .with({ type: "info" }, matched => matched.title)
        .with({ type: "success" }, () => t("Toast.Success.Title", undefined))
        .with({ type: "warning" }, () => t("Toast.Warning.Title", undefined))
        .with({ type: "error", error: { type: "generic" } }, () =>
            t("Toast.Error.Generic.Title", undefined),
        )
        .with({ type: "error", error: { type: "api" } }, () =>
            t("Toast.Error.Api.Title", undefined),
        )
        .with({ type: "error", error: { type: "api-validation" } }, () =>
            t("Toast.Error.Api.Validation.Title", undefined),
        )
        .exhaustive()

/**
 * @description Maps message values to standard-style description items
 * @param values Message values
 */
const makeStandardDescriptionItems = (
    values: readonly string[],
): ToastDescriptionItem[] =>
    values.map(value => ({ id: uid(), style: "standard", value }))

/**
 * @description Builds the description items of the new toast
 * @param newToast Toast described
 * @param t Translate function
 */
const getNewToastDescription = (
    newToast: NewToast,
    t: UiTranslate,
): ToastDescriptionItem[] =>
    match(newToast)
        .returnType<ToastDescriptionItem[]>()
        .with({ type: P.union("info", "success", "warning") }, matched =>
            makeStandardDescriptionItems(matched.messages ?? []),
        )
        .with(
            {
                type: "error",
                error: { type: "generic", messages: P.optional(P.array(P.string)) },
            },
            matched => makeStandardDescriptionItems(matched.error.messages ?? []),
        )
        .with(
            {
                type: "error",
                error: {
                    type: "api",
                    unknown: false,
                    messages: P.optional(P.array(P.string)),
                },
            },
            matched => [
                {
                    id: uid(),
                    style: "standard",
                    value: t("Toast.Error.Api.StatusMessage", {
                        status: String(matched.error.status),
                    }),
                },
                ...makeStandardDescriptionItems(matched.error.messages ?? []),
            ],
        )
        .with(
            {
                type: "error",
                error: { type: "api", unknown: true },
            },
            () => [
                {
                    id: uid(),
                    style: "standard",
                    value: t("Toast.Error.Api.UnknownDescription", undefined),
                },
            ],
        )
        .with({ type: "error", error: { type: "api-validation" } }, matched => [
            {
                id: uid(),
                style: "standard",
                value: t("Toast.Error.Api.Validation.Description", undefined),
            },
            { id: uid(), style: "mono", value: matched.error.zodError.message },
        ])
        .exhaustive()

/**
 * @description Maps a new toast to the data rendered by the toast component
 * @param newToast Toast described
 * @param t Translate function
 */
export const newToastToToastData = (newToast: NewToast, t: UiTranslate): ToastData => ({
    type: newToast.type,
    title: getNewToastTitle(newToast, t),
    description: getNewToastDescription(newToast, t),
})

export type CommonToast = "form-validation-error"

/**
 * @description Maps a common toast literal to a new toast
 * @param literal Preset toast identifier
 * @param t Translate function
 */
export const commonToastToNewToast = (literal: CommonToast, t: UiTranslate): NewToast =>
    match(literal)
        .returnType<NewToast>()
        .with("form-validation-error", () => ({
            type: "error",
            error: {
                type: "generic",
                messages: [t("Toast.Common.FormValidationError", undefined)],
            },
        }))
        .exhaustive()

/**
 * @description Builds a new toast from a type and one message
 * @param type Toast type
 * @param message Single message carried by the toast
 */
export const plainToastToNewToast = (type: ToastType, message: string): NewToast =>
    match(type)
        .returnType<NewToast>()
        .with("info", () => ({ type: "info", title: message }))
        .with("success", () => ({ type: "success", messages: [message] }))
        .with("warning", () => ({ type: "warning", messages: [message] }))
        .with("error", () => ({
            type: "error",
            error: { type: "generic", messages: [message] },
        }))
        .exhaustive()

export type ToastInput = NewToast | CommonToast

/**
 * @description Maps a new toast or a common toast literal to the rendered toast data
 * @param input Toast described, or a preset toast identifier
 * @param t Translate function
 */
export const toastInputToToastData = (input: ToastInput, t: UiTranslate): ToastData =>
    newToastToToastData(
        typeof input === "string" ? commonToastToNewToast(input, t) : input,
        t,
    )

/**
 * @description Returns the title and the description values joined by newlines
 * @param toast Toast data copied
 */
export const getClipboardTextFromToastData = (toast: ToastData): string =>
    [toast.title, ...toast.description.map(item => item.value)].join("\n")

/**
 * @remarks Holds the lifetime of the copied label, in milliseconds
 */
export const toastCopiedLabelExpiry = 1500

export interface ToastManager {
    base: BaseToastManager<object>
    add: (input: ToastInput) => string
    addPlain: (type: ToastType, message: string) => string
    close: (id?: string) => void
}

/**
 * @description Builds a toast manager mapping toast inputs to the Base UI manager
 * @param i18n Translate function holder
 */
export const createToastManager = (i18n: { t: UiTranslate }): ToastManager => {
    const base = ToastPrimitive.createToastManager<ToastData>()
    const add = (input: ToastInput) =>
        base.add({ data: toastInputToToastData(input, i18n.t) })
    return {
        base,
        add,
        addPlain: (type: ToastType, message: string) =>
            add(plainToastToNewToast(type, message)),
        close: (id?: string) => {
            base.close(id)
        },
    }
}
