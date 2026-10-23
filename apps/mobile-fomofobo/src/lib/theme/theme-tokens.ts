// Read in node by `tailwind.config.cjs` and `app.config.ts`: no React Native import here.

/**
 * @remarks Mirrors the palette of `packages/styles/src/globals.css`, PLACEHOLDER(TQ-08)
 */
const PALETTE = {
    ink: "#0c1e18",
    inkMuted: "#5c5a4f",
    inkSubtle: "#8e887a",
    paper: "#f0eade",
    paperMuted: "#e4ddcc",
    lineMuted: "#c6c0ae",
    grayLight: "#cbcbc6",
    red: "#f6481e",
    redStrong: "#b8300f",
    redPale: "#f9d5c8",
    yellow: "#f6d242",
    yellowPale: "#f8e7a8",
    greenStrong: "#276b33",
    greenPale: "#d6ead0",
    lilac: "#f0b4fc",
    sky: "#a6dcff",
    violet: "#6a3fd1",
    blueStrong: "#1f5f9e",
    bluePale: "#d4e4f2",
    amberStrong: "#8a5a00",
    mapGround: "#247860",
    mapBlock: "#18664e",
    mapDot: "#368a6c",
    mapWater: "#90e4c0",
    mapRoad: "#defcf0",
} as const

const SEMANTIC_COLORS = {
    white: "#ffffff",
    transparent: "transparent",

    surface: PALETTE.paper,
    "surface-muted": PALETTE.paperMuted,
    "surface-inverse": PALETTE.ink,
    overlay: "rgba(12, 30, 24, 0.6)",

    fg: PALETTE.ink,
    "fg-muted": PALETTE.inkMuted,
    "fg-subtle": PALETTE.inkSubtle,
    "fg-inverse": PALETTE.paper,

    line: PALETTE.ink,
    "line-muted": PALETTE.lineMuted,

    focus: PALETTE.violet,

    live: PALETTE.red,
    "live-strong": PALETTE.redStrong,
    upcoming: PALETTE.yellow,
    ended: PALETTE.grayLight,
    permanent: PALETTE.sky,
    social: PALETTE.lilac,
    position: PALETTE.lilac,

    danger: PALETTE.redStrong,
    "danger-surface": PALETTE.redPale,
    success: PALETTE.greenStrong,
    "success-surface": PALETTE.greenPale,
    warning: PALETTE.amberStrong,
    "warning-surface": PALETTE.yellowPale,
    info: PALETTE.blueStrong,
    "info-surface": PALETTE.bluePale,

    "map-ground": PALETTE.mapGround,
    "map-block": PALETTE.mapBlock,
    "map-dot": PALETTE.mapDot,
    "map-water": PALETTE.mapWater,
    "map-road": PALETTE.mapRoad,
} as const

/**
 * @remarks Holds the shadcn names that React Native Reusables copies use, so a fresh `add` renders in the fomofobo look
 */
const SHADCN_ALIASES = {
    background: SEMANTIC_COLORS.surface,
    foreground: SEMANTIC_COLORS.fg,
    card: SEMANTIC_COLORS.surface,
    "card-foreground": SEMANTIC_COLORS.fg,
    popover: SEMANTIC_COLORS.surface,
    "popover-foreground": SEMANTIC_COLORS.fg,
    primary: SEMANTIC_COLORS["surface-inverse"],
    "primary-foreground": SEMANTIC_COLORS["fg-inverse"],
    secondary: SEMANTIC_COLORS["surface-muted"],
    "secondary-foreground": SEMANTIC_COLORS.fg,
    muted: SEMANTIC_COLORS["surface-muted"],
    "muted-foreground": SEMANTIC_COLORS["fg-muted"],
    accent: SEMANTIC_COLORS["surface-muted"],
    "accent-foreground": SEMANTIC_COLORS.fg,
    destructive: SEMANTIC_COLORS.danger,
    "destructive-foreground": SEMANTIC_COLORS["fg-inverse"],
    border: SEMANTIC_COLORS.line,
    input: SEMANTIC_COLORS.line,
    ring: SEMANTIC_COLORS.focus,
} as const

export const THEME_COLORS = { ...SEMANTIC_COLORS, ...SHADCN_ALIASES }

export type ThemeColor = keyof typeof THEME_COLORS

export const FONT_FAMILIES = {
    display: "Space Mono",
    sans: "Funnel Sans",
} as const

/**
 * @remarks Holds the `tp-*` scale of the web in points, letter spacing included, since React Native has no `em`
 */
export const TYPE_SCALE = {
    "pixel-2xl": {
        family: "display",
        size: 32,
        lineHeight: 36,
        weight: 700,
        tracking: 0.32,
        upper: true,
    },
    "pixel-xl": {
        family: "display",
        size: 24,
        lineHeight: 28,
        weight: 700,
        tracking: 0.24,
        upper: true,
    },
    "pixel-lg": {
        family: "display",
        size: 18,
        lineHeight: 24,
        weight: 400,
        tracking: 0.36,
        upper: true,
    },
    "pixel-md": {
        family: "display",
        size: 13,
        lineHeight: 18,
        weight: 400,
        tracking: 0.78,
        upper: true,
    },
    "pixel-sm": {
        family: "display",
        size: 11,
        lineHeight: 16,
        weight: 400,
        tracking: 0.88,
        upper: true,
    },
    "body-lg": {
        family: "sans",
        size: 16,
        lineHeight: 24,
        weight: 400,
        tracking: 0,
        upper: false,
    },
    "body-md": {
        family: "sans",
        size: 14,
        lineHeight: 20,
        weight: 400,
        tracking: 0,
        upper: false,
    },
    "body-sm": {
        family: "sans",
        size: 12,
        lineHeight: 18,
        weight: 400,
        tracking: 0,
        upper: false,
    },
} as const

export const RADII = {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 14,
    full: 9999,
} as const

export const HARD_SHADOW_OFFSETS = {
    sm: 2,
    md: 3,
    lg: 4,
} as const
