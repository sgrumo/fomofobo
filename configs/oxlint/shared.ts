import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import { anyExtension } from "../shared.ts"

const configDir = dirname(fileURLToPath(import.meta.url))

export const customPluginPath = resolve(configDir, "lint-rules/src/custom-rules.mjs")

export const productionFiles = [`src/**/*.${anyExtension}`]
export const testFiles = [`**/*.{test,spec}.${anyExtension}`]

// Next reads a default export, and values beside it, from every App Router special file:
// `metadata` and `dynamic` from a page, the handlers from a route, the file itself from
// `sitemap`, `robots`, `manifest` and the image conventions.
export const nextConventionFiles = [
    `src/app/**/{page,layout,template,default,loading,error,global-error,not-found,route}.${anyExtension}`,
    `src/app/**/{sitemap,robots,manifest,opengraph-image,twitter-image,icon,apple-icon}.${anyExtension}`,
]

export const basePlugins = [
    "oxc",
    "eslint",
    "import",
    "promise",
    "unicorn",
    "typescript",
] as const
export const testPlugins = ["vitest"] as const
export const reactPlugins = ["react", "react-perf", "jsx-a11y"] as const
export const nextPlugins = ["nextjs"] as const

export const restrictOmit = {
    Omit: {
        message:
            'Use `StrictOmit` from "shared/types". `Omit` accepts keys absent from the type.',
        suggest: ["StrictOmit"],
    },
}

export const restrictExclude = {
    Exclude: {
        message:
            'Use `StrictExclude` from "shared/types". `Exclude` accepts members absent from the union.',
        suggest: ["StrictExclude"],
    },
}

export const restrictedZodImport = {
    name: "zod",
    importNames: ["z"],
    message: 'Import z from "@hono/zod-openapi" instead of "zod".',
}

export const restrictedDebugIdentityImport = {
    name: "shared",
    importNames: ["debugIdentity"],
}

export const restrictedCreateUseWebStorageImport = {
    name: "react-shared",
    importNames: ["createUseWebStorage"],
    message: "Use the pre-built useLocalStorage/useSessionStorage hooks.",
}

export const restrictedCreateWebStorageImport = {
    name: "frontend-shared/storage",
    importNames: ["createWebStorage"],
    message: "Use the pre-built localStorage/sessionStorage wrappers from @/lib/storage.",
}
