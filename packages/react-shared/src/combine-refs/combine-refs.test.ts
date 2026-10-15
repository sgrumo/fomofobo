import { createRef } from "react"
import { describe, expect, it, vi } from "vitest"

import { combineRefs } from "./combine-refs"

const mockElement = document.createElement("div")

describe("combineRefs", () => {
    it("sets a ref object's current to the element", () => {
        const ref = createRef<HTMLDivElement>()

        combineRefs(ref)(mockElement)

        expect(ref.current).toBe(mockElement)
    })

    it("calls a callback ref with the element", () => {
        const ref = vi.fn<(el: HTMLDivElement | null) => void>()

        combineRefs(ref)(mockElement)

        expect(ref).toHaveBeenCalledWith(mockElement)
    })

    it("sets multiple ref objects", () => {
        const ref1 = createRef<HTMLDivElement>()
        const ref2 = createRef<HTMLDivElement>()

        combineRefs(ref1, ref2)(mockElement)

        expect(ref1.current).toBe(mockElement)
        expect(ref2.current).toBe(mockElement)
    })

    it("handles a mix of callback and object refs", () => {
        const objectRef = createRef<HTMLDivElement>()
        const callbackRef = vi.fn<(el: HTMLDivElement | null) => void>()

        combineRefs(objectRef, callbackRef)(mockElement)

        expect(objectRef.current).toBe(mockElement)
        expect(callbackRef).toHaveBeenCalledWith(mockElement)
    })

    it("skips null and undefined refs", () => {
        const ref = createRef<HTMLDivElement>()

        combineRefs(null, ref, undefined)(mockElement)

        expect(ref.current).toBe(mockElement)
    })

    it("returns a cleanup that nullifies object refs", () => {
        const ref = createRef<HTMLDivElement>()

        const cleanup = combineRefs(ref)(mockElement)
        expect(ref.current).toBe(mockElement)

        cleanup()
        expect(ref.current).toBeNull()
    })

    it("returns a cleanup that calls callback ref cleanup functions", () => {
        const cleanupFn = vi.fn<() => void>()
        const callbackRef = vi
            .fn<(el: HTMLDivElement | null) => () => void>()
            .mockReturnValue(cleanupFn)

        const cleanup = combineRefs(callbackRef)(mockElement)
        cleanup()

        expect(cleanupFn).toHaveBeenCalledOnce()
    })

    it("handles callback refs that return no cleanup", () => {
        const callbackRef = vi
            .fn<(el: HTMLDivElement | null) => undefined>()
            .mockReturnValue(undefined)

        const cleanup = combineRefs(callbackRef)(mockElement)

        expect(() => {
            cleanup()
        }).not.toThrow()
    })

    it("sets ref to null when called with null element", () => {
        const ref = createRef<HTMLDivElement>()

        combineRefs(ref)(mockElement)
        expect(ref.current).toBe(mockElement)

        combineRefs(ref)(null)
        expect(ref.current).toBeNull()
    })
})
