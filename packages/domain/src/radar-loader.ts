import { runsPathOf } from "./pixel-markers"
import { RADAR_LOADER_RUNS } from "./radar-loader-runs"

export const RADAR_LOADER = {
    cells: RADAR_LOADER_RUNS.cells,
    tickMs: RADAR_LOADER_RUNS.tickMs,
    framePaths: RADAR_LOADER_RUNS.frames.map(frame => runsPathOf(frame)),
    // Frame shown at each tick of the cycle
    tickFrames: RADAR_LOADER_RUNS.sequence.flatMap(([frame, ticks]) =>
        Array.from({ length: ticks }, () => frame),
    ),
}

// Time the loader takes to fade in
export const RADAR_LOADER_FADE_MS = 300
