import { median } from "es-toolkit"

export const PERF_MARKS = [
    "first-results",
    "first-view",
    "pin-preview",
    "detail",
    "chip-markers",
    "pan-markers",
] as const

export type PerfMark = (typeof PERF_MARKS)[number]

// A frame past two frames at 60 Hz drops at least one frame
export const LONG_FRAME_MS = 34

const KEPT_DURATIONS = 20

export interface FrameStats {
    fps: number
    longFrames: number
    worstMs: number
}

export interface MarkStats {
    last: number | undefined
    median: number | undefined
    count: number
}

interface PerfState {
    enabled: boolean
    pending: ReadonlyMap<PerfMark, number>
    durations: ReadonlyMap<PerfMark, readonly number[]>
}

const initialState: PerfState = {
    enabled: false,
    pending: new Map(),
    durations: new Map(),
}

let state = initialState
const listeners = new Set<() => void>()

/**
 * @description Replaces the state and notifies every subscriber
 * @param next State that replaces the current one
 */
const publish = (next: PerfState) => {
    state = next
    for (const listener of listeners) {
        listener()
    }
}

/**
 * @description Turns the recording of the marks on or off
 * @param enabled True to record
 */
export const setPerfEnabled = (enabled: boolean) => {
    publish({ ...state, enabled })
}

/**
 * @description Starts a mark, replacing a start that never ended
 * @param mark Interaction measured
 * @param at Start instant on the `performance.now()` clock
 */
export const startMark = (mark: PerfMark, at: number = performance.now()) => {
    if (!state.enabled) {
        return
    }
    publish({ ...state, pending: new Map(state.pending).set(mark, at) })
}

/**
 * @description Ends a started mark and keeps its duration, with no effect on a mark that never started
 * @param mark Interaction measured
 * @param at End instant on the `performance.now()` clock
 */
export const endMark = (mark: PerfMark, at: number = performance.now()) => {
    const startedAt = state.pending.get(mark)
    if (!state.enabled || startedAt === undefined) {
        return
    }
    const pending = new Map(state.pending)
    pending.delete(mark)
    const kept = [...(state.durations.get(mark) ?? []), at - startedAt].slice(
        -KEPT_DURATIONS,
    )
    publish({ ...state, pending, durations: new Map(state.durations).set(mark, kept) })
}

/**
 * @description Drops every pending mark and every kept duration
 */
export const resetMarks = () => {
    publish({ ...state, pending: new Map(), durations: new Map() })
}

/**
 * @description Returns the last and the median duration of a mark, in milliseconds
 * @param mark Interaction measured
 */
export const markStatsOf = (mark: PerfMark): MarkStats => {
    const durations = state.durations.get(mark) ?? []
    return {
        last: durations.at(-1),
        median: durations.length === 0 ? undefined : median(durations),
        count: durations.length,
    }
}

/**
 * @description Returns the frame rate, the count of long frames and the worst frame of a window
 * @param frames Count of frames in the window
 * @param totalMs Sum of the frame durations, in milliseconds
 * @param longFrames Count of frames over `LONG_FRAME_MS`
 * @param worstMs Longest frame, in milliseconds
 */
export const frameStatsOf = (
    frames: number,
    totalMs: number,
    longFrames: number,
    worstMs: number,
): FrameStats => ({
    fps: totalMs === 0 ? 0 : Math.round((frames * 1000) / totalMs),
    longFrames,
    worstMs: Math.round(worstMs),
})

/**
 * @description Subscribes to every change of the marks
 * @param listener Called after each change
 */
export const subscribePerf = (listener: () => void) => {
    listeners.add(listener)
    return () => {
        listeners.delete(listener)
    }
}

/**
 * @description Returns the current state, for `useSyncExternalStore`
 */
export const readPerf = () => state
