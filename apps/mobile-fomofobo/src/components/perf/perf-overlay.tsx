import { useEffect, useRef, useState, useSyncExternalStore } from "react"
import { Platform, Pressable, Share, View } from "react-native"
import { useFrameCallback, useSharedValue } from "react-native-reanimated"
import { startProfiling, stopProfiling } from "react-native-release-profiler"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { Text } from "@/components/ui/text/text"
import {
    frameStatsOf,
    LONG_FRAME_MS,
    markStatsOf,
    PERF_MARKS,
    readPerf,
    resetMarks,
    subscribePerf,
} from "@/lib/perf/perf-store"
import type { FrameStats, PerfMark } from "@/lib/perf/perf-store"

const WINDOW_MS = 1000

interface FrameWindow {
    frames: number
    totalMs: number
    longFrames: number
    worstMs: number
}

const EMPTY_WINDOW: FrameWindow = { frames: 0, totalMs: 0, longFrames: 0, worstMs: 0 }

const NO_FRAME_STATS = frameStatsOf(0, 0, 0, 0)

interface OverlayButtonProps {
    label: string
    onPress: () => void
}

const OverlayButton = (props: OverlayButtonProps) => (
    <Pressable
        accessibilityRole="button"
        accessibilityLabel={props.label}
        hitSlop={8}
        onPress={props.onPress}
        className="border border-fg-inverse px-2 py-1"
    >
        <Text variant="body-sm" className="text-fg-inverse">
            {props.label}
        </Text>
    </Pressable>
)

/**
 * @description Returns one line of frame stats
 * @param label Thread measured
 * @param stats Stats of the last window
 */
const frameLineOf = (label: string, stats: FrameStats) =>
    `${label} ${String(stats.fps)} fps · ${String(stats.longFrames)} long · worst ${String(stats.worstMs)} ms`

/**
 * @description Returns one line of mark stats, `-` for a mark with no duration yet
 * @param mark Interaction measured
 */
const markLineOf = (mark: PerfMark) => {
    const stats = markStatsOf(mark)
    const ms = (value: number | undefined) =>
        value === undefined ? "-" : `${String(Math.round(value))} ms`
    return `${mark}: last ${ms(stats.last)} · median ${ms(stats.median)} · n ${String(stats.count)}`
}

// Dev-only control in plain English: frame rates of both threads, interaction marks, and a
// Hermes profile of the release build
export const PerfOverlay = () => {
    const insets = useSafeAreaInsets()
    const [expanded, setExpanded] = useState(false)
    const [profiling, setProfiling] = useState(false)
    const [profilePath, setProfilePath] = useState<string>()
    const [jsStats, setJsStats] = useState(NO_FRAME_STATS)
    const [uiStats, setUiStats] = useState(NO_FRAME_STATS)
    // Subscribes to the marks, so the lines below read fresh stats on each change
    useSyncExternalStore(subscribePerf, readPerf)

    const jsWindow = useRef<FrameWindow>(EMPTY_WINDOW)
    const uiFrames = useSharedValue(0)
    const uiTotalMs = useSharedValue(0)
    const uiLongFrames = useSharedValue(0)
    const uiWorstMs = useSharedValue(0)
    const uiFrameCallback = useFrameCallback(frame => {
        const elapsed = frame.timeSincePreviousFrame
        if (elapsed === null) {
            return
        }
        uiFrames.set(uiFrames.get() + 1)
        uiTotalMs.set(uiTotalMs.get() + elapsed)
        uiLongFrames.set(uiLongFrames.get() + (elapsed > LONG_FRAME_MS ? 1 : 0))
        uiWorstMs.set(Math.max(uiWorstMs.get(), elapsed))
    }, false)

    // The loops run only while the panel is open, so a closed panel costs no frame
    useEffect(() => {
        if (!expanded) {
            return undefined
        }
        uiFrameCallback.setActive(true)
        const loop = { frame: 0, previous: performance.now() }
        const onFrame = (now: number) => {
            const elapsed = now - loop.previous
            loop.previous = now
            const current = jsWindow.current
            jsWindow.current = {
                frames: current.frames + 1,
                totalMs: current.totalMs + elapsed,
                longFrames: current.longFrames + (elapsed > LONG_FRAME_MS ? 1 : 0),
                worstMs: Math.max(current.worstMs, elapsed),
            }
            loop.frame = requestAnimationFrame(onFrame)
        }
        loop.frame = requestAnimationFrame(onFrame)
        // Reads the shared values once a window: a read from JS waits for the UI thread
        const timer = setInterval(() => {
            const js = jsWindow.current
            jsWindow.current = EMPTY_WINDOW
            setJsStats(frameStatsOf(js.frames, js.totalMs, js.longFrames, js.worstMs))
            setUiStats(
                frameStatsOf(
                    uiFrames.get(),
                    uiTotalMs.get(),
                    uiLongFrames.get(),
                    uiWorstMs.get(),
                ),
            )
            uiFrames.set(0)
            uiTotalMs.set(0)
            uiLongFrames.set(0)
            uiWorstMs.set(0)
        }, WINDOW_MS)
        return () => {
            cancelAnimationFrame(loop.frame)
            clearInterval(timer)
            uiFrameCallback.setActive(false)
        }
    }, [expanded, uiFrameCallback, uiFrames, uiTotalMs, uiLongFrames, uiWorstMs])

    const toggleProfile = async () => {
        if (!profiling) {
            setProfilePath(undefined)
            setProfiling(startProfiling())
            return
        }
        const path = await stopProfiling(true)
        setProfiling(false)
        setProfilePath(path)
        // Android saves the trace to Downloads, iOS hands it to the share sheet
        if (Platform.OS === "ios") {
            await Share.share({ url: `file://${path}` })
        }
    }

    return (
        <View
            pointerEvents="box-none"
            className="absolute left-4"
            style={{ bottom: insets.bottom + 72 }}
        >
            {expanded && (
                <View className="mb-2 gap-1 bg-surface-inverse p-2">
                    <Text variant="body-sm" className="text-fg-inverse">
                        {frameLineOf("JS", jsStats)}
                    </Text>
                    <Text variant="body-sm" className="text-fg-inverse">
                        {frameLineOf("UI", uiStats)}
                    </Text>
                    {PERF_MARKS.map(mark => (
                        <Text key={mark} variant="body-sm" className="text-fg-inverse">
                            {markLineOf(mark)}
                        </Text>
                    ))}
                    {profilePath !== undefined && (
                        <Text variant="body-sm" className="text-fg-inverse">
                            {`Profile: ${profilePath}`}
                        </Text>
                    )}
                    <View className="flex-row gap-2">
                        <OverlayButton label="Reset marks" onPress={resetMarks} />
                        <OverlayButton
                            label={profiling ? "Stop profile" : "Start profile"}
                            onPress={() => {
                                void toggleProfile()
                            }}
                        />
                    </View>
                </View>
            )}
            <View className="flex-row bg-surface-inverse">
                <OverlayButton
                    label={expanded ? "Hide perf" : "Perf"}
                    onPress={() => {
                        setExpanded(!expanded)
                    }}
                />
            </View>
        </View>
    )
}
