import { fileURLToPath } from "node:url"

import type { NextConfig } from "next"

import { languageRedirects } from "./src/lib/i18n/language-redirects"

// The workspace packages ship raw TypeScript, so Next compiles them with the app.
const workspacePackages = [
    "api-client",
    "components-samples",
    "components-showcase",
    "frontend-shared",
    "models",
    "react-shared",
    "shared",
    "styles",
    "ui-components",
]

const nextConfig: NextConfig = {
    reactCompiler: true,
    // Next appends a managed agent-rules block to AGENTS.md and CLAUDE.md when an
    // agent starts `next dev`. AGENTS.md carries that instruction already.
    agentRules: false,
    // Traces the function files from the repo root, or the deploy misses every
    // workspace package the app imports.
    outputFileTracingRoot: fileURLToPath(new URL("../..", import.meta.url)),
    transpilePackages: workspacePackages,
    redirects: () => Promise.resolve(languageRedirects),
}

export default nextConfig
