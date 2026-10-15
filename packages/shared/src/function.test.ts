import { afterEach, describe, expect, it, vi } from "vitest"

import { mustTake, runOnce } from "./function"
import { sleep } from "./temporal"

describe("mustTake", () => {
    afterEach(() => {
        // Keep this order. If timers reset first, `restoreMocks` brings the fake
        // `setTimeout` back before the next test.
        vi.restoreAllMocks()
        vi.useRealTimers()
    })

    it("returns the result of `fn`", async () => {
        await expect(mustTake(() => Promise.resolve(42), { ms: 0 })).resolves.toBe(42)
    })

    it("runs `fn` immediately, without sleeping, for non-positive `ms`", async () => {
        vi.useFakeTimers()
        const setTimeoutSpy = vi.spyOn(globalThis, "setTimeout")

        await expect(mustTake(() => Promise.resolve("v"), { ms: 0 })).resolves.toBe("v")
        await expect(mustTake(() => Promise.resolve("v"), { ms: -50 })).resolves.toBe("v")

        expect(setTimeoutSpy).not.toHaveBeenCalled()
    })

    it("runs `fn` immediately, without sleeping, for `NaN` or infinite `ms`", async () => {
        vi.useFakeTimers()
        const setTimeoutSpy = vi.spyOn(globalThis, "setTimeout")

        await expect(
            mustTake(() => Promise.resolve("v"), { ms: Number.NaN }),
        ).resolves.toBe("v")
        await expect(
            mustTake(() => Promise.resolve("v"), { ms: Number.POSITIVE_INFINITY }),
        ).resolves.toBe("v")

        expect(setTimeoutSpy).not.toHaveBeenCalled()
    })

    it("pads execution to at least `ms` when `fn` resolves early", async () => {
        vi.useFakeTimers()
        const onResolved = vi.fn<(value: string) => void>()
        const settled = mustTake(() => Promise.resolve("v"), { ms: 100 })
        const observed = settled.then(onResolved)

        // `fn` has settled, but the promise must stay pending until `ms` elapses
        await vi.advanceTimersByTimeAsync(99)
        expect(onResolved).not.toHaveBeenCalled()

        await vi.advanceTimersByTimeAsync(1)
        await observed
        expect(onResolved).toHaveBeenCalledWith("v")
    })

    it("does not sleep further when `fn` already takes longer than `ms`", async () => {
        vi.useFakeTimers()
        const setTimeoutSpy = vi.spyOn(globalThis, "setTimeout")

        const settled = mustTake(() => sleep({ ms: 200 }).then(() => "v"), { ms: 100 })
        await vi.advanceTimersByTimeAsync(200)

        await expect(settled).resolves.toBe("v")
        // the only timer is `fn`'s own `sleep`; `mustTake` schedules none
        expect(setTimeoutSpy).toHaveBeenCalledOnce()
    })

    it("propagates errors thrown by `fn`, but only after sleeping", async () => {
        vi.useFakeTimers()
        const onRejected = vi.fn<(error: unknown) => void>()
        const failing = mustTake(() => Promise.reject(new Error("boom")), { ms: 100 })
        const observed = failing.catch(onRejected)

        // `fn` already rejected, but the minimum duration must still elapse first
        await vi.advanceTimersByTimeAsync(99)
        expect(onRejected).not.toHaveBeenCalled()

        await vi.advanceTimersByTimeAsync(1)
        await observed
        expect(onRejected).toHaveBeenCalledWith(new Error("boom"))
    })
})

describe("runOnce", () => {
    it("should make a concurrent caller wait for the same completion", async () => {
        const order: string[] = []
        const gate = Promise.withResolvers<undefined>()

        const run = runOnce(async setRun => {
            await gate.promise
            order.push("initialized")
            setRun()
        })

        const first = run()
        const second = run().then(() => {
            order.push("second returned")
            return undefined
        })

        gate.resolve(undefined)
        await Promise.all([first, second])

        expect(order).toStrictEqual(["initialized", "second returned"])
    })

    it("should run the action one time once it has run", async () => {
        const action = vi.fn<(setRun: () => void) => Promise<void>>(async setRun => {
            setRun()
            await Promise.resolve()
        })
        const run = runOnce(action)

        await run()
        await run()

        expect(action).toHaveBeenCalledOnce()
    })

    it("should run the action again when it never marks itself as run", async () => {
        const action = vi.fn<() => Promise<void>>(async () => {
            await Promise.resolve()
        })
        const run = runOnce(action)

        await run()
        await run()

        expect(action).toHaveBeenCalledTimes(2)
    })
})
