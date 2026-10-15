import { isEqual } from "es-toolkit"
import { useState } from "react"

const colorGroups = [
    {
        name: "surface",
        vars: [
            ["surface", "--color-surface"],
            ["surface-muted", "--color-surface-muted"],
            ["surface-inverse", "--color-surface-inverse"],
            ["backdrop", "--color-backdrop"],
            ["overlay", "--color-overlay"],
        ],
    },
    {
        name: "text",
        vars: [
            ["fg", "--color-fg"],
            ["fg-muted", "--color-fg-muted"],
            ["fg-subtle", "--color-fg-subtle"],
            ["fg-inverse", "--color-fg-inverse"],
        ],
    },
    {
        name: "line",
        vars: [
            ["line", "--color-line"],
            ["line-muted", "--color-line-muted"],
            ["focus", "--color-focus"],
        ],
    },
    {
        name: "status",
        vars: [
            ["live", "--color-live"],
            ["live-strong", "--color-live-strong"],
            ["upcoming", "--color-upcoming"],
            ["ended", "--color-ended"],
            ["social", "--color-social"],
            ["position", "--color-position"],
        ],
    },
    {
        name: "feedback",
        vars: [
            ["danger", "--color-danger"],
            ["danger-surface", "--color-danger-surface"],
            ["success", "--color-success"],
            ["success-surface", "--color-success-surface"],
            ["warning", "--color-warning"],
            ["warning-surface", "--color-warning-surface"],
            ["info", "--color-info"],
            ["info-surface", "--color-info-surface"],
        ],
    },
    {
        name: "map",
        vars: [
            ["map-ground", "--color-map-ground"],
            ["map-block", "--color-map-block"],
            ["map-dot", "--color-map-dot"],
            ["map-water", "--color-map-water"],
            ["map-road", "--color-map-road"],
        ],
    },
] as const

/**
 * @description Maps an `rgb()` color string to its hex form
 * @param rgb Color string read
 * @remarks Returns the trimmed input when it holds fewer than three numbers
 */
const rgbToHex = (rgb: string): string => {
    const match = rgb.match(/\d+/gu)
    if (!match || match.length < 3) {
        return rgb.trim()
    }
    const r = Number(match[0])
    const g = Number(match[1])
    const b = Number(match[2])
    return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`
}

/**
 * @description Returns the computed value of the CSS variable as a hex color
 * @param element Element the style is computed on
 * @param cssVar Custom property read
 * @remarks Returns the raw value for a color neither hex nor `rgb()`
 */
const resolveColor = (element: Element, cssVar: string): string => {
    const raw = getComputedStyle(element).getPropertyValue(cssVar).trim()
    if (raw.startsWith("#")) {
        return raw
    }
    if (raw.startsWith("rgb")) {
        return rgbToHex(raw)
    }
    return raw
}

export const ColorsShowcase = () => {
    const [colors, setColors] = useState<Record<string, string>>({})

    const resolve = (element: HTMLDivElement | null) => {
        if (!element) {
            return
        }

        const resolved: Record<string, string> = {}
        for (const group of colorGroups) {
            for (const [name, cssVar] of group.vars) {
                resolved[name] = resolveColor(element, cssVar)
            }
        }

        if (!isEqual(colors, resolved)) {
            setColors(resolved)
        }
    }

    return (
        <div ref={resolve} className="flex w-full flex-col gap-6">
            {colorGroups.map(group => (
                <div key={group.name} className="flex flex-col gap-2">
                    <div className="flex flex-wrap gap-4">
                        {group.vars.map(([name]) => (
                            <div
                                key={name}
                                className="border-line-muted flex w-32 flex-col gap-1 overflow-clip rounded-lg border pb-2"
                            >
                                <div
                                    className="h-16 w-full"
                                    style={{
                                        backgroundColor: `var(--color-${name})`,
                                    }}
                                />
                                <span className="tp-pixel-md px-2">{name}</span>
                                <span className="tp-pixel-md text-fg-muted px-2">
                                    {colors[name]?.toUpperCase()}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    )
}
