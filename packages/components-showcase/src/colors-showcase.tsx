import { isEqual } from "es-toolkit"
import { useState } from "react"

const colorGroups = [
    { name: "white", vars: [["white", "--color-white"]] },
    {
        name: "neutral",
        vars: [
            ["neutral-50", "--color-neutral-50"],
            ["neutral-100", "--color-neutral-100"],
            ["neutral-200", "--color-neutral-200"],
            ["neutral-300", "--color-neutral-300"],
            ["neutral-400", "--color-neutral-400"],
            ["neutral-500", "--color-neutral-500"],
            ["neutral-600", "--color-neutral-600"],
            ["neutral-700", "--color-neutral-700"],
            ["neutral-800", "--color-neutral-800"],
            ["neutral-900", "--color-neutral-900"],
            ["neutral-950", "--color-neutral-950"],
        ],
    },
    { name: "black", vars: [["black", "--color-black"]] },
    {
        name: "primary",
        vars: [
            ["primary-100", "--color-primary-100"],
            ["primary-200", "--color-primary-200"],
            ["primary-300", "--color-primary-300"],
            ["primary-400", "--color-primary-400"],
            ["primary-500", "--color-primary-500"],
            ["primary-600", "--color-primary-600"],
            ["primary-700", "--color-primary-700"],
            ["primary-800", "--color-primary-800"],
        ],
    },
    {
        name: "info",
        vars: [
            ["info-100", "--color-info-100"],
            ["info-200", "--color-info-200"],
            ["info-300", "--color-info-300"],
            ["info-400", "--color-info-400"],
            ["info-500", "--color-info-500"],
            ["info-600", "--color-info-600"],
            ["info-700", "--color-info-700"],
            ["info-800", "--color-info-800"],
            ["info-900", "--color-info-900"],
        ],
    },
    {
        name: "success",
        vars: [
            ["success-100", "--color-success-100"],
            ["success-200", "--color-success-200"],
            ["success-300", "--color-success-300"],
            ["success-400", "--color-success-400"],
            ["success-500", "--color-success-500"],
            ["success-600", "--color-success-600"],
            ["success-700", "--color-success-700"],
            ["success-800", "--color-success-800"],
            ["success-900", "--color-success-900"],
        ],
    },
    {
        name: "warning",
        vars: [
            ["warning-100", "--color-warning-100"],
            ["warning-200", "--color-warning-200"],
            ["warning-300", "--color-warning-300"],
            ["warning-400", "--color-warning-400"],
            ["warning-500", "--color-warning-500"],
            ["warning-600", "--color-warning-600"],
            ["warning-700", "--color-warning-700"],
            ["warning-800", "--color-warning-800"],
            ["warning-900", "--color-warning-900"],
        ],
    },
    {
        name: "danger",
        vars: [
            ["danger-100", "--color-danger-100"],
            ["danger-200", "--color-danger-200"],
            ["danger-300", "--color-danger-300"],
            ["danger-400", "--color-danger-400"],
            ["danger-500", "--color-danger-500"],
            ["danger-600", "--color-danger-600"],
            ["danger-700", "--color-danger-700"],
            ["danger-800", "--color-danger-800"],
            ["danger-900", "--color-danger-900"],
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
                                className="flex w-32 flex-col gap-1 overflow-clip rounded-lg border border-neutral-200 pb-2 dark:border-neutral-700"
                            >
                                <div
                                    className="h-16 w-full"
                                    style={{
                                        backgroundColor: `var(--color-${name})`,
                                    }}
                                />
                                <span className="tp-mono-b2 px-2">{name}</span>
                                <span className="tp-mono-b2 px-2 text-neutral-500 dark:text-neutral-400">
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
