import { act, renderHook } from "@testing-library/react"
import type { FormResult } from "frontend-shared/types"
import { err, ok } from "shared/result"
import { describe, expect, it } from "vitest"

import { useForm } from "./use-form"

interface State {
    title: string | undefined
}

const convert = (state: State): FormResult<State, { title: string }> =>
    state.title === undefined || state.title === ""
        ? err({ title: { errors: ["required"] } })
        : ok({ title: state.title })

const convertIn = (
    state: State,
    language: string,
): FormResult<State, { title: string }> =>
    state.title === undefined || state.title === ""
        ? err({ title: { errors: [`${language}: required`] } })
        : ok({ title: state.title })

describe("useForm", () => {
    it("holds the initial value and exposes the bound conversion", () => {
        const { result } = renderHook(() =>
            useForm<State, { title: string }, []>({ title: "a" }, convert),
        )

        expect(result.current.form).toStrictEqual({ title: "a" })
        expect(result.current.errors).toBeUndefined()
        expect(result.current.convert({ title: undefined })).toStrictEqual(
            err({ title: { errors: ["required"] } }),
        )
        expect(result.current.formId).toStrictEqual(expect.any(String))
    })

    it("resolves a value factory on the first render", () => {
        const { result } = renderHook(() =>
            useForm(() => ({ title: undefined }), convert),
        )

        expect(result.current.form).toStrictEqual({ title: undefined })
        expect(result.current.errors).toStrictEqual({ title: { errors: ["required"] } })
    })

    it("recomputes errors when the form changes", () => {
        const { result } = renderHook(() =>
            useForm<State, { title: string }, []>({ title: undefined }, convert),
        )

        act(() => {
            result.current.setForm({ title: "b" })
        })

        expect(result.current.form).toStrictEqual({ title: "b" })
        expect(result.current.errors).toBeUndefined()
    })

    it("forwards the fixed arguments and recomputes when they change", () => {
        let language = "en"
        const { result, rerender } = renderHook(() =>
            useForm({ title: undefined }, convertIn, language),
        )
        expect(result.current.errors).toStrictEqual({
            title: { errors: ["en: required"] },
        })

        language = "it"
        rerender()

        expect(result.current.errors).toStrictEqual({
            title: { errors: ["it: required"] },
        })
        expect(result.current.convert({ title: undefined })).toStrictEqual(
            err({ title: { errors: ["it: required"] } }),
        )
    })

    it("keeps the same form id across renders", () => {
        const { result, rerender } = renderHook(() =>
            useForm<State, { title: string }, []>({ title: "a" }, convert),
        )
        const firstId = result.current.formId

        rerender()

        expect(result.current.formId).toBe(firstId)
    })
})
