import { existsSync, readdirSync } from "node:fs"
import path from "node:path"

const repoRoot = path.resolve(import.meta.dirname, "../../../..")

/**
 * @description Returns every `public/locales` directory the apps hold
 * @param explicit Directory given on the command line, relative to the repo root
 * @throws When no app of the project holds a locales directory
 * @remarks Returns every match, sorted, so a project with two frontends keeps both in
 * step. Scans `apps/`, so it names no app and survives whichever ones a project holds
 */
export const resolveLocalesDirs = (explicit?: string): string[] => {
    if (explicit !== undefined && explicit !== "") {
        return [path.resolve(repoRoot, explicit)]
    }

    const appsDir = path.join(repoRoot, "apps")
    const found = existsSync(appsDir)
        ? readdirSync(appsDir, { withFileTypes: true })
              .filter(entry => entry.isDirectory())
              .map(entry => path.join(appsDir, entry.name, "public", "locales"))
              .filter(candidate => existsSync(candidate))
              .toSorted()
        : []

    if (found.length === 0) {
        throw new Error(
            "No locales directory found. Pass one explicitly, or add apps/<app>/public/locales.",
        )
    }

    return found
}
