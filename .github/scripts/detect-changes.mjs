// Writes to GITHUB_OUTPUT which parts of the repo the changes since BASE reach:
// `web` (every workspace package but the mobile app), `mobile` and `vercel` (the deploy of
// fullstack-fomofobo). An empty or unknown BASE reaches every part. See .github/AGENTS.md.
import { execFileSync } from "node:child_process"
import { appendFileSync, readFileSync } from "node:fs"

const { BASE = "", GITHUB_OUTPUT } = process.env

const mobileApp = "mobile-fomofobo"
const vercelApp = "fullstack-fomofobo"
const rootProject = JSON.parse(readFileSync("package.json", "utf8")).name

// A file that every package reads without a workspace dependency on it.
const sharedPrefixes = [
    "pnpm-lock.yaml",
    "pnpm-workspace.yaml",
    "package.json",
    ".nvmrc",
    "configs/",
    ".github/actions/",
    ".github/workflows/ci.yaml",
    ".github/workflows/quality.yaml",
    ".github/workflows/quality-e2e.yaml",
    ".github/scripts/detect-changes.mjs",
]

// A deploy file outside the workspace packages that the app depends on.
const vercelPrefixes = [
    "infra/vercel/",
    ".github/workflows/deploy-vercel.yaml",
    ".github/scripts/write-vercel-env.mjs",
]

/**
 * @description Returns the parts that the changes since the base reach, or null when git or pnpm cannot tell
 * @param base Commit the changes start from
 */
const detect = base => {
    try {
        const files = execFileSync("git", ["diff", "--name-only", base, "HEAD"], {
            encoding: "utf8",
        })
            .split("\n")
            .filter(file => file !== "")
        const packages = JSON.parse(
            execFileSync(
                "pnpm",
                ["list", "--filter", `...[${base}]`, "--depth", "-1", "--json"],
                { encoding: "utf8" },
            ),
        ).map(project => project.name)
        const touches = prefixes =>
            files.some(file => prefixes.some(prefix => file.startsWith(prefix)))
        const shared = touches(sharedPrefixes)

        return {
            web:
                shared ||
                packages.some(name => name !== mobileApp && name !== rootProject),
            mobile: shared || packages.includes(mobileApp),
            vercel: shared || touches(vercelPrefixes) || packages.includes(vercelApp),
        }
    } catch (error) {
        console.error("Change detection failed, every part runs:", error)
        return null
    }
}

const everything = { web: true, mobile: true, vercel: true }
const parts = /^0*$/u.test(BASE) ? everything : (detect(BASE) ?? everything)

console.log(parts)
appendFileSync(
    GITHUB_OUTPUT,
    Object.entries(parts)
        .map(([part, reached]) => `${part}=${reached}\n`)
        .join(""),
)
