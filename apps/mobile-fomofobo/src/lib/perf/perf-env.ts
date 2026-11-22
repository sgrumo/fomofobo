import { z } from "zod"

import { env } from "@/lib/env"

import { measuresPerformance } from "../../../config/target"
import { setPerfEnabled, startMark } from "./perf-store"

// React Native sets it on `performance` with no type, on the `performance.now()` clock: the
// launch of the app when the native code logs it, else the start of the React runtime
const startupTimingSchema = z.object({ startTime: z.number() })

export const perfMeasured = measuresPerformance(env.appEnv)

/**
 * @description Turns the marks on in a measuring build, and starts the startup marks at the launch of the app
 * @remarks Starts the startup marks at the first line of JS when React Native reports no start time
 */
export const startPerf = () => {
    setPerfEnabled(perfMeasured)
    const timing = startupTimingSchema.safeParse(
        Reflect.get(performance, "rnStartupTiming"),
    )
    const startedAt = timing.success ? timing.data.startTime : 0
    startMark("first-results", startedAt)
    startMark("first-view", startedAt)
}
