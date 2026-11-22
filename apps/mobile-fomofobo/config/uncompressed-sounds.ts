import { withAppBuildGradle } from "expo/config-plugins.js"
import type { ConfigPlugin } from "expo/config-plugins.js"

const RESOURCES_BLOCK = "androidResources {"

// AAPT deflates a FLAC by default, and the Android media player opens a raw resource only when
// the package stores it as it is
const NO_COMPRESS_FLAC = "noCompress.add('flac')"

/**
 * @description Returns the app `build.gradle` with FLAC files stored uncompressed in the package
 * @param contents Contents of the app `build.gradle`
 * @throws When the file has no `androidResources` block
 */
export const uncompressedSoundsGradle = (contents: string): string => {
    if (!contents.includes(RESOURCES_BLOCK)) {
        throw new Error("The app build.gradle has no androidResources block")
    }
    return contents.includes(NO_COMPRESS_FLAC)
        ? contents
        : contents.replace(
              RESOURCES_BLOCK,
              `${RESOURCES_BLOCK}\n        ${NO_COMPRESS_FLAC}`,
          )
}

/**
 * @description Stores the FLAC sounds of the app uncompressed in the Android package, so the
 * release build plays them
 * @param config Expo config
 */
export const withUncompressedSounds: ConfigPlugin = config =>
    withAppBuildGradle(config, gradle => ({
        ...gradle,
        modResults: {
            ...gradle.modResults,
            contents: uncompressedSoundsGradle(gradle.modResults.contents),
        },
    }))
