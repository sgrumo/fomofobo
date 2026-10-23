const plugin = require("tailwindcss/plugin")

// Tailwind loads this file through jiti, which also resolves the TypeScript token module
const {
    FONT_FAMILIES,
    RADII,
    THEME_COLORS,
    TYPE_SCALE,
} = require("./src/lib/theme/theme-tokens.ts")

const px = value => `${String(value)}px`

const typeScaleUtilities = Object.fromEntries(
    Object.entries(TYPE_SCALE).map(([name, step]) => [
        `.tp-${name}`,
        {
            fontFamily: `"${FONT_FAMILIES[step.family]}"`,
            fontSize: px(step.size),
            lineHeight: px(step.lineHeight),
            fontWeight: String(step.weight),
            letterSpacing: px(step.tracking),
            textTransform: step.upper ? "uppercase" : "none",
        },
    ]),
)

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{js,jsx,ts,tsx}"],
    presets: [require("nativewind/preset")],
    theme: {
        colors: THEME_COLORS,
        borderRadius: Object.fromEntries(
            Object.entries(RADII).map(([name, value]) => [name, px(value)]),
        ),
        // `extend`, since the NativeWind preset sets the system families there
        extend: {
            fontFamily: {
                sans: [`"${FONT_FAMILIES.sans}"`],
                display: [`"${FONT_FAMILIES.display}"`],
                mono: [`"${FONT_FAMILIES.display}"`],
            },
        },
    },
    plugins: [
        plugin(api => {
            api.addUtilities(typeScaleUtilities)
        }),
    ],
}
