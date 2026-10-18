import { createSerwistRoute } from "@serwist/turbopack"
import { languageKeys } from "i18n/i18n"

import { routes } from "@/framework/routes/routes"

// One revision per build: a deploy precaches the shell pages again, with their new chunks.
const revision = crypto.randomUUID()

const offlinePages = Object.fromEntries(
    languageKeys.map(lang => [
        lang,
        routes.offline.path({ parameters: { lang }, query: {} }),
    ]),
)
const shellPages = languageKeys.flatMap(lang => [
    routes.saved.path({ parameters: { lang }, query: {} }),
    routes.offline.path({ parameters: { lang }, query: {} }),
])

// Builds `sw.js` with esbuild at build time and serves it as a static file.
export const { dynamic, dynamicParams, revalidate, generateStaticParams, GET } =
    createSerwistRoute({
        swSrc: "src/service-worker/sw.ts",
        useNativeEsbuild: true,
        // A classic script registers in every browser that runs the app.
        esbuildOptions: {
            format: "iife",
            define: { OFFLINE_PAGES: JSON.stringify(offlinePages) },
        },
        additionalPrecacheEntries: shellPages.map(url => ({ url, revision })),
        // The chunks are cached as pages load them: precaching the build would ship the backoffice too.
        globPatterns: ["public/**/*"],
        // The locale files reach the browser inside the page, never as a request.
        globIgnores: ["public/locales/**"],
    })
