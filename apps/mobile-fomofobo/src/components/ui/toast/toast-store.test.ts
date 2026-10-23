import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { dismissToast, readToasts, showToast, subscribeToasts } from "./toast-store"

describe("toast store", () => {
    beforeEach(() => {
        vi.useFakeTimers()
    })

    afterEach(() => {
        for (const toast of readToasts()) {
            dismissToast(toast.id)
        }
        vi.useRealTimers()
    })

    it("shows a toast until its duration ends", () => {
        showToast({ tone: "info", title: "Saved" }, 2000)
        expect(readToasts().map(toast => toast.title)).toStrictEqual(["Saved"])

        vi.advanceTimersByTime(2000)
        expect(readToasts()).toStrictEqual([])
    })

    it("notifies a subscriber on every change", () => {
        const listener = vi.fn<() => void>()
        const unsubscribe = subscribeToasts(listener)

        showToast({ tone: "error", title: "Offline" }, 1000)
        vi.advanceTimersByTime(1000)
        unsubscribe()
        showToast({ tone: "error", title: "Offline" }, 1000)

        expect(listener).toHaveBeenCalledTimes(2)
    })
})
