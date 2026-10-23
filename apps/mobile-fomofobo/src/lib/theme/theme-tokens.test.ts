// The suite runs in node and reads the source files of the app
// oxlint-disable-next-line import/no-nodejs-modules
import { readdirSync, readFileSync } from "node:fs"

import { describe, expect, it } from "vitest"

import { THEME_COLORS } from "./theme-tokens"
import type { ThemeColor } from "./theme-tokens"

const srcDir = new URL("../../", import.meta.url)

const sourceFiles = readdirSync(srcDir, { recursive: true, encoding: "utf8" }).filter(
    file => /\.tsx?$/u.test(file) && !/\.test\.tsx?$/u.test(file),
)

// A utility whose suffix names a color, after any `variant:` prefixes
const colorUtility =
    /(?<=^|[\s"'`])(?:[\w-]+:)*(?<utility>bg|text|border|divide|ring|fill|stroke)-(?<suffix>[a-z][\w-]*?)(?:\/\d+)?(?=[\s"'`]|$)/gmu

const nonColorSuffixes: Record<string, RegExp> = {
    bg: /^$/u,
    text: /^(?:xs|sm|base|lg|\d?xl|left|center|right|justify|start|end|balance|wrap|nowrap|ellipsis|clip)$/u,
    border: /^(?:[xytrblse](?:-\d+)?|\d+|solid|dashed|dotted|none)$/u,
    divide: /^(?:[xy](?:-\d+)?|\d+)$/u,
    ring: /^(?:\d+|inset|offset(?:-\d+)?)$/u,
    fill: /^$/u,
    stroke: /^\d+$/u,
}

const colorClasses = sourceFiles.flatMap(file =>
    [...readFileSync(new URL(file, srcDir), "utf8").matchAll(colorUtility)]
        .map(found => ({
            file,
            utility: found.groups?.utility ?? "",
            suffix: found.groups?.suffix ?? "",
        }))
        .filter(found => !nonColorSuffixes[found.utility]?.test(found.suffix)),
)

/**
 * @description Returns the WCAG relative luminance of a `#rrggbb` color
 * @param hex Color to measure
 */
const luminance = (hex: string) => {
    const [red = 0, green = 0, blue = 0] = [1, 3, 5]
        .map(start => Number.parseInt(hex.slice(start, start + 2), 16) / 255)
        .map(channel =>
            channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
        )
    return 0.2126 * red + 0.7152 * green + 0.0722 * blue
}

/**
 * @description Returns the WCAG contrast ratio of two `#rrggbb` colors
 * @param first One color of the pair
 * @param second Other color of the pair
 */
const contrast = (first: string, second: string) => {
    const [darker, lighter] = [luminance(first), luminance(second)].toSorted(
        (left, right) => left - right,
    )
    return ((lighter ?? 0) + 0.05) / ((darker ?? 0) + 0.05)
}

// Every pair the app sets text in. `fg-subtle` marks disabled controls only, which WCAG exempts.
const textPairs: ReadonlyArray<readonly [ThemeColor, ThemeColor]> = [
    ["fg", "surface"],
    ["fg", "surface-muted"],
    ["fg-muted", "surface"],
    ["fg-muted", "surface-muted"],
    ["fg-inverse", "surface-inverse"],
    ["fg-inverse", "danger"],
    ["fg", "live"],
    ["fg", "upcoming"],
    ["fg", "ended"],
    ["fg", "permanent"],
    ["fg", "social"],
    ["fg", "danger-surface"],
    ["fg", "success-surface"],
    ["fg", "warning-surface"],
    ["fg", "info-surface"],
]

describe("theme tokens", () => {
    it("resolve every color class of the app", () => {
        expect(
            colorClasses.filter(found => !Object.hasOwn(THEME_COLORS, found.suffix)),
        ).toStrictEqual([])
    })

    it.each(textPairs)("set %s on %s at WCAG AA", (text, background) => {
        expect(
            contrast(THEME_COLORS[text], THEME_COLORS[background]),
        ).toBeGreaterThanOrEqual(4.5)
    })
})
