import fs from "node:fs/promises"
import path from "node:path"

import { flattenNestedObject, generateCsv, nestedObjectSchema } from "i18n/translations"

import { resolveLocalesDirs } from "../lib/locales-dir.ts"

/**
 * @description Writes one CSV file per namespace, holding one column per language
 * @throws When the locales directory holds no language directory
 */
const main = async () => {
    const projectRoot = path.resolve(import.meta.dirname, "../../../..")
    // Every app holds the same namespaces, so the first directory is enough to
    // export from.
    const [localesDir] = resolveLocalesDirs(process.argv[2])
    if (localesDir === undefined) {
        throw new Error("No locales directory found")
    }
    const outputDir = path.join(projectRoot, "translation-exports")

    const entries = await fs.readdir(localesDir, { withFileTypes: true })
    const languages = entries
        .filter(entry => entry.isDirectory())
        .map(entry => entry.name)
        .toSorted()

    if (languages.length === 0) {
        throw new Error("no locale directories found")
    }

    const namespaces = new Set<string>()
    for (const lang of languages) {
        const langDir = path.join(localesDir, lang)
        const files = await fs.readdir(langDir)
        for (const file of files) {
            if (file.endsWith(".json")) {
                namespaces.add(file.replace(/\.json$/u, ""))
            }
        }
    }

    await fs.mkdir(outputDir, { recursive: true })

    for (const namespace of [...namespaces].toSorted()) {
        const translationsByLang: Record<string, Record<string, string>> = {}

        for (const lang of languages) {
            const filePath = path.join(localesDir, lang, `${namespace}.json`)
            try {
                const raw: unknown = JSON.parse(await fs.readFile(filePath, "utf8"))
                const parsed = nestedObjectSchema.parse(raw)
                translationsByLang[lang] = flattenNestedObject(parsed)
            } catch {
                console.log(
                    `skipping ${lang}/${namespace}.json (file not found or invalid)`,
                )
            }
        }

        const csv = generateCsv(languages, translationsByLang)
        const outputPath = path.join(outputDir, `${namespace}.csv`)
        await fs.writeFile(outputPath, csv, "utf8")
        console.log(`exported ${namespace}.csv`)
    }

    console.log("translation export complete")
}

void main()
