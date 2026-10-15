import { act, renderHook } from "@testing-library/react"
import { identity } from "es-toolkit"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { useDebounced } from "./use-debounced"

const debouncedIndex = 0
const debouncingIndex = 1
const valueIndex = 2

describe("useDebounced", () => {
    beforeEach(() => {
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    describe("initial state", () => {
        it("initializes debounced to current value when no initialValue is provided", () => {
            const { result } = renderHook(() => useDebounced("hello", identity, 500))

            expect(result.current[debouncedIndex]).toBe("hello")
            expect(result.current[valueIndex]).toBe("hello")
            expect(result.current[debouncingIndex]).toBe(false)
        })

        it("resolves value factory function on render", () => {
            const { result } = renderHook(() =>
                useDebounced(() => "computed", identity, 500),
            )

            expect(result.current[valueIndex]).toBe("computed")
            expect(result.current[debouncedIndex]).toBe("computed")
            expect(result.current[debouncingIndex]).toBe(false)
        })
    })

    describe("debouncing state", () => {
        it("is false when value has not changed", () => {
            const value = "hello"
            const { result, rerender } = renderHook(() =>
                useDebounced(value, identity, 500),
            )

            rerender()

            expect(result.current[debouncingIndex]).toBe(false)
        })

        it("is true when value changes and delay has not elapsed", () => {
            let value = "hello"
            const { result, rerender } = renderHook(() =>
                useDebounced(value, identity, 500),
            )

            value = "world"
            rerender()

            expect(result.current[debouncingIndex]).toBe(true)
            expect(result.current[debouncedIndex]).toBe("hello")
            expect(result.current[valueIndex]).toBe("world")
        })

        it("is false after delay elapses", () => {
            let value = "hello"
            const { result, rerender } = renderHook(() =>
                useDebounced(value, identity, 500),
            )

            value = "world"
            rerender()

            act(() => {
                vi.advanceTimersByTime(500)
            })

            expect(result.current[debouncingIndex]).toBe(false)
            expect(result.current[debouncedIndex]).toBe("world")
        })
    })

    describe("delay modes", () => {
        it("updates debounced value after the specified delay", () => {
            let value = "hello"
            const { result, rerender } = renderHook(() =>
                useDebounced(value, identity, 300),
            )

            value = "world"
            rerender()

            act(() => {
                vi.advanceTimersByTime(299)
            })
            expect(result.current[debouncedIndex]).toBe("hello")

            act(() => {
                vi.advanceTimersByTime(1)
            })
            expect(result.current[debouncedIndex]).toBe("world")
        })

        it("resets the timeout when value changes again before delay elapses", () => {
            let value = "hello"
            const { result, rerender } = renderHook(() =>
                useDebounced(value, identity, 500),
            )

            value = "world"
            rerender()

            act(() => {
                vi.advanceTimersByTime(300)
            })

            value = "foo"
            rerender()

            act(() => {
                vi.advanceTimersByTime(300)
            })

            expect(result.current[debouncedIndex]).toBe("hello")
            expect(result.current[debouncingIndex]).toBe(true)

            act(() => {
                vi.advanceTimersByTime(200)
            })

            expect(result.current[debouncedIndex]).toBe("foo")
            expect(result.current[debouncingIndex]).toBe(false)
        })

        it("updates synchronously when delay is 'none'", () => {
            let value = "hello"
            const { result, rerender } = renderHook(() =>
                useDebounced(value, identity, "none"),
            )

            value = "world"
            rerender()

            expect(result.current[debouncedIndex]).toBe("world")
            expect(result.current[debouncingIndex]).toBe(false)
        })

        it("updates on next tick when delay is 'next-tick'", () => {
            let value = "hello"
            const { result, rerender } = renderHook(() =>
                useDebounced(value, identity, "next-tick"),
            )

            value = "world"
            rerender()

            expect(result.current[debouncingIndex]).toBe(true)

            act(() => {
                vi.runAllTimers()
            })

            expect(result.current[debouncedIndex]).toBe("world")
            expect(result.current[debouncingIndex]).toBe(false)
        })

        it("uses default delay of 500ms when delay is not specified", () => {
            let value = "hello"
            const { result, rerender } = renderHook(() => useDebounced(value, identity))

            value = "world"
            rerender()

            act(() => {
                vi.advanceTimersByTime(499)
            })
            expect(result.current[debouncedIndex]).toBe("hello")

            act(() => {
                vi.advanceTimersByTime(1)
            })
            expect(result.current[debouncedIndex]).toBe("world")
        })
    })

    describe("by comparator", () => {
        it("uses by to determine whether value has changed", () => {
            let value = { id: 1, name: "Alice" }
            const { result, rerender } = renderHook(() =>
                useDebounced(value, v => v.id, 500),
            )

            value = { id: 1, name: "Bob" }
            rerender()

            expect(result.current[debouncingIndex]).toBe(false)
        })

        it("triggers debounce when by returns a different primitive", () => {
            let value = { id: 1, name: "Alice" }
            const { result, rerender } = renderHook(() =>
                useDebounced(value, v => v.id, 500),
            )

            value = { id: 2, name: "Alice" }
            rerender()

            expect(result.current[debouncingIndex]).toBe(true)
        })
    })

    describe("cleanup", () => {
        it("clears the pending timeout on unmount", () => {
            let value = "hello"
            const { rerender, unmount } = renderHook(() =>
                useDebounced(value, identity, 500),
            )

            value = "world"
            rerender()
            unmount()

            expect(() => {
                act(() => {
                    vi.advanceTimersByTime(500)
                })
            }).not.toThrow()
        })
    })
})
