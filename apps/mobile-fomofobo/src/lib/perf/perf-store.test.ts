import { afterEach, describe, expect, it } from "vitest"

import {
    endMark,
    frameStatsOf,
    markStatsOf,
    resetMarks,
    setPerfEnabled,
    startMark,
} from "./perf-store"

describe("marks", () => {
    afterEach(() => {
        resetMarks()
        setPerfEnabled(false)
    })

    it("keeps the duration between a start and its end", () => {
        setPerfEnabled(true)
        startMark("pin-preview", 100)
        endMark("pin-preview", 340)

        expect(markStatsOf("pin-preview")).toStrictEqual({
            last: 240,
            median: 240,
            count: 1,
        })
    })

    it("records nothing while disabled", () => {
        startMark("detail", 0)
        endMark("detail", 50)

        expect(markStatsOf("detail")).toStrictEqual({
            last: undefined,
            median: undefined,
            count: 0,
        })
    })

    it("ignores an end with no start, and a second end of one start", () => {
        setPerfEnabled(true)
        endMark("chip-markers", 10)
        startMark("chip-markers", 20)
        endMark("chip-markers", 50)
        endMark("chip-markers", 90)

        expect(markStatsOf("chip-markers")).toMatchObject({ last: 30, count: 1 })
    })

    it("measures from the latest start of a mark", () => {
        setPerfEnabled(true)
        startMark("pan-markers", 0)
        startMark("pan-markers", 100)
        endMark("pan-markers", 160)

        expect(markStatsOf("pan-markers")).toMatchObject({ last: 60 })
    })

    it("keeps the median of the last twenty durations", () => {
        setPerfEnabled(true)
        for (const duration of Array.from({ length: 25 }, (_, index) => index + 1)) {
            startMark("detail", 0)
            endMark("detail", duration)
        }

        expect(markStatsOf("detail")).toStrictEqual({ last: 25, median: 15.5, count: 20 })
    })
})

describe("frameStatsOf", () => {
    it("returns the frame rate of a window and its long frames", () => {
        expect(frameStatsOf(60, 1000, 2, 48.6)).toStrictEqual({
            fps: 60,
            longFrames: 2,
            worstMs: 49,
        })
    })

    it("returns zero frames per second for an empty window", () => {
        expect(frameStatsOf(0, 0, 0, 0)).toStrictEqual({
            fps: 0,
            longFrames: 0,
            worstMs: 0,
        })
    })
})
