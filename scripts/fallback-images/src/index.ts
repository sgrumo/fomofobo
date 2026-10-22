import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import { pathToFileURL } from "node:url"
import { parseArgs } from "node:util"

import { categoryIconValues, PHOTO_DITHER_DARK, PHOTO_DITHER_LIGHT } from "models"
import { encodeTwoColorPng } from "shared/image"
import { pixelIconBitmaps } from "ui-components/pixel-icons/bitmaps"

import { FALLBACK_GRID, fallbackGrid } from "./fallback-grid"

const USAGE = `Usage:
  pnpm fallback-images [--out <folder>]

Draws the fallback image of each category icon, 1200 x 630 in the two colors of the
dithered photos, into the public folder of the app, or into <folder>.`

// 200 x 105 cells of 6 px: the 1200 x 630 card of a link preview
const CELL_PIXELS = 6
const DEFAULT_OUT = new URL(
    "../../../apps/fullstack-fomofobo/public/fallbacks/",
    import.meta.url,
)

/**
 * @description Writes the fallback image of every category icon into the folder
 */
const main = async (): Promise<void> => {
    const { values } = parseArgs({ options: { out: { type: "string" } } })
    const out =
        values.out === undefined
            ? DEFAULT_OUT
            : pathToFileURL(`${path.resolve(values.out)}/`)
    await mkdir(out, { recursive: true })
    for (const icon of categoryIconValues) {
        const png = await encodeTwoColorPng(
            fallbackGrid(pixelIconBitmaps[icon]),
            FALLBACK_GRID,
            [PHOTO_DITHER_DARK, PHOTO_DITHER_LIGHT],
            CELL_PIXELS,
        )
        await writeFile(new URL(`${icon}.png`, out), png)
        console.info(`Wrote ${icon}.png`)
    }
}

main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : String(error))
    console.error(`\n${USAGE}`)
    process.exitCode = 1
})
