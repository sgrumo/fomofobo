import fs from "node:fs/promises"
import path from "node:path"

import { parse } from "csv-parse/sync"
import { google } from "googleapis"
import { buildNestedObject } from "i18n/translations"

import { resolveLocalesDirs } from "../lib/locales-dir.ts"

interface Translation {
    ID: string
    Value: string
}

type TranslationMap = Record<string, Record<string, Translation[]>>

/**
 * @description True when the list holds one value more than one time
 * @param arr List checked
 */
const containsDuplicates = (arr: string[]): boolean => new Set(arr).size !== arr.length

/**
 * @description Downloads the spreadsheet and writes one JSON file per page and language
 * @throws When the spreadsheet id is missing, or when no locales directory exists
 */
const main = async () => {
    const args = process.argv.slice(2)
    const credentialsPath = path.join(import.meta.dirname, "../../credentials.json")
    const [spreadsheetId, outputDirArg] = args
    if (!spreadsheetId) {
        throw new Error("usage: pnpm i18n:download <spreadsheetId> [localesDir]")
    }
    const outputDirs = resolveLocalesDirs(outputDirArg)

    console.log("downloading translations from Google Sheets...")
    const csvContent = await downloadSheet(credentialsPath, spreadsheetId)
    if (csvContent === null) {
        return
    }

    console.log("processing CSV...")
    // Every app that holds locales gets the same files, so two frontends never drift.
    for (const outputDir of outputDirs) {
        console.log(`writing ${outputDir}...`)
        await processTranslations(csvContent, outputDir)
    }

    console.log("translation files generated successfully")
}

/**
 * @description Fetches every sheet of the spreadsheet as one CSV text
 * @param credentialsPath Path of the service account key file
 * @param spreadsheetId Id of the spreadsheet read
 * @remarks Returns `null` for a failed precheck, and URI-encodes every cell
 */
const downloadSheet = async (
    credentialsPath: string,
    spreadsheetId: string,
): Promise<string | null> => {
    const auth = new google.auth.JWT({
        keyFile: credentialsPath,
        scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    })

    const sheets = google.sheets({ version: "v4", auth })
    const sheetMetadata = await sheets.spreadsheets.get({
        spreadsheetId,
    })
    const allSheets =
        sheetMetadata.data.sheets
            ?.map(s => s.properties?.title)
            .filter(s => typeof s === "string") ?? []

    if (allSheets.length === 0) {
        console.log("stopping here, no sheets detected in fetched resource")
        return null
    }
    if (containsDuplicates(allSheets)) {
        console.error("one or more sheets have the same name")
        return null
    }

    const responses = await Promise.all(
        allSheets.map(async sheet => {
            const response = await sheets.spreadsheets.values.get({
                spreadsheetId,
                range: sheet,
                valueRenderOption: "UNFORMATTED_VALUE",
            })
            return [sheet, response] as const
        }),
    )

    const [firstResponse] = responses
    if (!firstResponse) {
        console.error("no responses available")
        return null
    }
    const firstValues = firstResponse[1].data.values ?? []
    const [firstRow] = firstValues
    if (!firstRow) {
        console.error("no header found in any sheet")
        return null
    }
    const header = firstRow.filter(v => typeof v === "string")

    const rows = responses.flatMap(([sheet, response]) =>
        (response.data.values ?? []).map((row: unknown[], idx) => {
            if (idx === 0) {
                const typedRow = row.filter(v => typeof v === "string")
                if (!header.every((h, i) => h === typedRow[i])) {
                    console.error(`header mismatch in sheet ${sheet}`)
                }
                return []
            }

            row.unshift(sheet)
            return row
        }),
    )

    return [["Section", ...header], ...rows]
        .map(row =>
            row
                .map((cell: unknown) => {
                    if (typeof cell !== "string") {
                        return null
                    }

                    return cell.includes(",") ? `"${encodeURI(cell)}"` : encodeURI(cell)
                })
                .filter(c => typeof c === "string")
                .join(","),
        )
        .join("\n")
}

/**
 * @description Writes one JSON translation file per page and language
 * @param csvContent CSV text holding the section, the id, and one column per language
 * @param outputDir Directory holding the generated language directories
 */
const processTranslations = async (csvContent: string, outputDir: string) => {
    const records: string[][] = parse(csvContent, {
        skip_empty_lines: true,
        trim: true,
    })

    if (records.length === 0) {
        console.error("no records in CSV")
        return
    }

    const [header] = records
    if (!header) {
        console.error("no header in records")
        return
    }
    const languages = header.slice(2)
    const translations: TranslationMap = {}

    for (const record of records.slice(1)) {
        const [section, id] = record
        if (!section || !id) {
            continue
        }
        const page = section.split("/")[0]?.toLowerCase()
        if (!page) {
            continue
        }

        for (let i = 0; i < languages.length; i += 1) {
            const lang = languages[i]
            const value = record[i + 2]

            if (!value || !lang) {
                continue
            }

            translations[page] ??= {}
            translations[page][lang] ??= []

            translations[page][lang].push({
                ID: id,
                Value: decodeURI(value),
            })
        }
    }

    for (const [page, langMap] of Object.entries(translations)) {
        for (const [lang, trans] of Object.entries(langMap)) {
            const dirPath = path.join(outputDir, lang)
            await fs.mkdir(dirPath, { recursive: true })

            const flatMap: Record<string, string> = {}
            for (const t of trans) {
                flatMap[t.ID] = t.Value
            }

            const nested = buildNestedObject(flatMap)
            const filePath = path.join(dirPath, `${page}.json`)
            await fs.writeFile(filePath, `${JSON.stringify(nested, null, 4)}\n`, "utf8")
            await fs.chmod(filePath, 0o755)
        }
    }
}

void main()
