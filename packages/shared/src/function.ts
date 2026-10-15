import { Result } from "./result"
import { sleep } from "./temporal"

/**
 * @description Returns a runner executing the action at most one time
 * @param run Action receiving the callback marking it as run
 * @throws When the action rejects
 * @remarks Runs the action again when the action never calls `setRun`
 * @remarks Hands the in-flight promise to a caller that arrives while the action runs,
 * so every caller waits for the same completion. Returning early instead would let the
 * second caller continue against a half-initialized system
 */
export const runOnce = (
    run: (setRun: () => void) => Promise<void>,
): (() => Promise<void>) => {
    let initialized = false
    let inFlight: Promise<void> | null = null

    const setRun = () => {
        initialized = true
    }

    return async () => {
        if (initialized) {
            return
        }
        if (inFlight) {
            await inFlight
            return
        }

        const attempt = Result.tryAsync(() => run(setRun))
        inFlight = attempt.then(() => undefined)

        const initialization = await attempt
        inFlight = null

        if (!initialization.success) {
            throw initialization.error
        }
    }
}

/**
 * @description Returns a getter that runs the builder once and keeps its value
 * @template T Built value type
 * @param build Builder run on the first call
 * @remarks Hands the in-flight promise to every caller that arrives during the build
 * @remarks Drops the cache when the build rejects, so a dependency that was briefly
 * unreachable does not fail every later call. `memoize` keeps the rejected promise
 * instead, which turns one timeout into a dead process
 */
export const lazyAsync = <T>(build: () => Promise<T>): (() => Promise<T>) => {
    let pending: Promise<T> | undefined = undefined

    return (): Promise<T> => {
        pending ??= build().catch((error: unknown) => {
            pending = undefined
            throw error
        })
        return pending
    }
}

/**
 * @description Runs the action, then waits out the rest of the minimum duration
 * @template T Action result type
 * @param fn Action run under the floor
 * @param opts Minimum duration, in milliseconds
 * @remarks Skips the wait when `opts.ms` is not a positive finite number
 */
export const mustTake = async <T>(
    fn: () => Promise<T>,
    opts: { ms: number },
): Promise<T> => {
    if (opts.ms <= 0 || Number.isNaN(opts.ms) || !Number.isFinite(opts.ms)) {
        return fn()
    }

    const start = Date.now()
    try {
        return await fn()
    } finally {
        const remaining = opts.ms - (Date.now() - start)
        if (remaining > 0) {
            await sleep({ ms: remaining })
        }
    }
}
