import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { act, fireEvent, getDefaultNormalizer, render, screen } from "../test/test-utils"
import { testT as t } from "../test/ui-i18n"
import { ToastProvider } from "./toast"
import {
    createToastManager,
    toastCopiedLabelExpiry,
    toastDataSchema,
} from "./toast.helper"
import type { NewToast } from "./toast.helper"

/**
 * @description Renders the toast provider, then adds the toast through its manager
 * @param newToast Toast added
 */
const renderToast = (newToast: NewToast) => {
    const manager = createToastManager({ t })
    const result = render(<ToastProvider toastManager={manager.base} />)
    act(() => {
        manager.add(newToast)
    })
    return result
}

describe("Toast", () => {
    const writeText = vi.fn<(text: string) => Promise<void>>()

    beforeEach(() => {
        writeText.mockResolvedValue(undefined)
        Object.defineProperty(navigator, "clipboard", {
            configurable: true,
            value: { writeText },
        })
    })

    afterEach(() => {
        // Keep this order. If timers reset first, `restoreAllMocks` brings the fake `setTimeout` back.
        vi.restoreAllMocks()
        vi.useRealTimers()
    })

    it("renders an info toast with its title and messages", () => {
        renderToast({
            type: "info",
            title: "Update available",
            messages: ["Line one", "Line two"],
        })

        expect(screen.getByText("Update available")).toBeInTheDocument()
        expect(screen.getByText("Line one")).toBeInTheDocument()
        expect(screen.getByText("Line two")).toBeInTheDocument()
    })

    it("renders a success toast", () => {
        renderToast({ type: "success", messages: ["Saved"] })

        expect(screen.getByText(t("Toast.Success.Title", undefined))).toBeInTheDocument()
        expect(screen.getByText("Saved")).toBeInTheDocument()
    })

    it("renders a warning toast", () => {
        renderToast({ type: "warning", messages: ["Be careful"] })

        expect(screen.getByText(t("Toast.Warning.Title", undefined))).toBeInTheDocument()
        expect(screen.getByText("Be careful")).toBeInTheDocument()
    })

    it("renders an error toast", () => {
        renderToast({
            type: "error",
            error: { type: "generic", messages: ["Something failed"] },
        })

        expect(
            screen.getByText(t("Toast.Error.Generic.Title", undefined)),
        ).toBeInTheDocument()
        expect(screen.getByText("Something failed")).toBeInTheDocument()
    })

    it("renders an error toast with the API status message", () => {
        renderToast({
            type: "error",
            error: {
                type: "api",
                unknown: false,
                status: 500,
                messages: ["Server exploded"],
            },
        })

        expect(
            screen.getByText(t("Toast.Error.Api.Title", undefined)),
        ).toBeInTheDocument()
        expect(
            screen.getByText(t("Toast.Error.Api.StatusMessage", { status: "500" })),
        ).toBeInTheDocument()
        expect(screen.getByText("Server exploded")).toBeInTheDocument()
    })

    it("renders an error toast with the parsed zod error", () => {
        const parsed = toastDataSchema.safeParse({})
        expect.assert(!parsed.success)

        const zodError = parsed.error

        renderToast({
            type: "error",
            error: { type: "api-validation", zodError },
        })

        expect(
            screen.getByText(t("Toast.Error.Api.Validation.Title", undefined)),
        ).toBeInTheDocument()
        expect(
            screen.getByText(t("Toast.Error.Api.Validation.Description", undefined)),
        ).toBeInTheDocument()
        expect(
            screen.getByText(zodError.message, {
                normalizer: getDefaultNormalizer({
                    collapseWhitespace: false,
                    trim: false,
                }),
            }),
        ).toBeInTheDocument()
    })

    it("copies the title and messages to the clipboard when copy is clicked", () => {
        renderToast({
            type: "warning",
            messages: ["First", "Second"],
        })

        fireEvent.click(screen.getByRole("button", { name: t("Toast.Copy", undefined) }))

        expect(writeText).toHaveBeenCalledWith(
            `${t("Toast.Warning.Title", undefined)}\nFirst\nSecond`,
        )
    })

    it("reveals the copied confirmation and hides it after the timeout", () => {
        vi.useFakeTimers()
        renderToast({ type: "warning", messages: ["Heads up"] })

        const confirmation = screen.getByText(t("Toast.Copied", undefined)).parentElement
        expect(confirmation).toHaveAttribute("aria-hidden", "true")

        fireEvent.click(screen.getByRole("button", { name: t("Toast.Copy", undefined) }))
        expect(confirmation).toHaveAttribute("aria-hidden", "false")

        act(() => {
            vi.advanceTimersByTime(toastCopiedLabelExpiry)
        })
        expect(confirmation).toHaveAttribute("aria-hidden", "true")
    })

    it("clears the copied timeout when the toast is unmounted", () => {
        vi.useFakeTimers()
        const setTimeoutSpy = vi.spyOn(globalThis, "setTimeout")
        const clearTimeoutSpy = vi.spyOn(globalThis, "clearTimeout")

        const { unmount } = renderToast({ type: "warning", messages: ["Heads up"] })

        fireEvent.click(screen.getByRole("button", { name: t("Toast.Copy", undefined) }))

        const copiedCallIndex = setTimeoutSpy.mock.calls.findIndex(
            ([, delay]) => delay === toastCopiedLabelExpiry,
        )
        const copiedTimeoutId: unknown =
            setTimeoutSpy.mock.results[copiedCallIndex]?.value

        unmount()

        expect(copiedTimeoutId).toBeDefined()
        expect(clearTimeoutSpy).toHaveBeenCalledWith(copiedTimeoutId)
    })
})
