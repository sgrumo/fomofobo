import { existsSync } from "node:fs"
import path from "node:path"

import type { ExpoConfig } from "expo/config"
import { languageKeys } from "i18n/i18n"

// The Expo config loader resolves a relative import only with its extension.
import { parseEnv } from "./config/env.ts"
import { resolveTarget } from "./config/target.ts"
import { FONT_FAMILIES, THEME_COLORS } from "./src/lib/theme/theme-tokens.ts"

const env = parseEnv(process.env)
const target = resolveTarget(env.APP_ENV)

// Both stores reject a build identifier they have already seen, and `prebuild` regenerates
// the git-ignored native projects on every run, so the value cannot live in those projects.
// The lanes set APP_BUILD_NUMBER from the highest identifier the store or App Distribution
// holds.
const buildNumber = env.APP_BUILD_NUMBER ?? 1

// The local and dev builds carry their own application id, so they install beside the store
// build on one phone.
const baseAppId = "it.quinck.fomofobo"
const appId = `${baseAppId}${target.appIdSuffix}`

/**
 * @description Returns the config path when the file is present, undefined otherwise
 * @param file Name of the native Firebase config file
 * @remarks Omits the key rather than failing, so a build with no Firebase file still prebuilds
 */
const googleServicesFile = (file: string): string | undefined =>
    existsSync(path.join(process.cwd(), target.firebaseDir, file))
        ? `./${target.firebaseDir}/${file}`
        : undefined

// Static faces of the `@expo-google-fonts` packages, embedded at build time
const fontFiles = {
    displayRegular:
        "./node_modules/@expo-google-fonts/space-mono/400Regular/SpaceMono_400Regular.ttf",
    displayBold:
        "./node_modules/@expo-google-fonts/space-mono/700Bold/SpaceMono_700Bold.ttf",
    sansRegular:
        "./node_modules/@expo-google-fonts/funnel-sans/400Regular/FunnelSans_400Regular.ttf",
    sansBold:
        "./node_modules/@expo-google-fonts/funnel-sans/700Bold/FunnelSans_700Bold.ttf",
}

const config: ExpoConfig = {
    extra: {
        appEnv: env.APP_ENV,
        apiUrl: env.API_URL,
        // An unversioned build reports the fallback below, which the version gate reads as a
        // real release. The app then sends no version, so the gate leaves it alone.
        versioned: env.APP_VERSION !== undefined,
    },
    name: "fomofobo",
    slug: "fomofobo",
    version: env.APP_VERSION ?? "1.0.0",
    scheme: target.scheme,
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    backgroundColor: THEME_COLORS.surface,
    ios: {
        supportsTablet: true,
        bundleIdentifier: appId,
        buildNumber: String(buildNumber),
        googleServicesFile: googleServicesFile("GoogleService-Info.plist"),
        infoPlist: {
            CFBundleAllowMixedLocalizations: true,
        },
    },
    android: {
        package: appId,
        versionCode: buildNumber,
        googleServicesFile: googleServicesFile("google-services.json"),
        adaptiveIcon: {
            foregroundImage: "./assets/adaptive-icon.png",
            backgroundColor: "#ffffff",
        },
        predictiveBackGestureEnabled: false,
    },
    web: {
        favicon: "./assets/favicon.png",
    },
    // Copy of the native permission prompts
    locales: Object.fromEntries(
        languageKeys.map(language => [language, `./native-locales/${language}.json`]),
    ),
    plugins: [
        "expo-router",
        "@maplibre/maplibre-react-native",
        "expo-location",
        // iOS reads the app languages for its native UI and its store listing
        ["expo-localization", { supportedLocales: { ios: languageKeys } }],
        [
            "expo-splash-screen",
            {
                image: "./assets/splash-icon.png",
                resizeMode: "contain",
                backgroundColor: THEME_COLORS.surface,
            },
        ],
        // iOS takes the family name from the font file. Android takes it from `fontFamily`, which
        // matches that name, so one `fontFamily` and a `fontWeight` select a face on both.
        [
            "expo-font",
            {
                ios: { fonts: Object.values(fontFiles) },
                android: {
                    fonts: [
                        {
                            fontFamily: FONT_FAMILIES.display,
                            fontDefinitions: [
                                { path: fontFiles.displayRegular, weight: 400 },
                                { path: fontFiles.displayBold, weight: 700 },
                            ],
                        },
                        {
                            fontFamily: FONT_FAMILIES.sans,
                            fontDefinitions: [
                                { path: fontFiles.sansRegular, weight: 400 },
                                { path: fontFiles.sansBold, weight: 700 },
                            ],
                        },
                    ],
                },
            },
        ],
        // R8 shrinks and obfuscates the release build. A native library that reaches a class
        // by reflection needs a keep rule in `extraProguardRules`, or the release build crashes
        // where the debug build works.
        [
            "expo-build-properties",
            {
                android: {
                    enableMinifyInReleaseBuilds: true,
                    enableShrinkResourcesInReleaseBuilds: true,
                },
            },
        ],
    ],
}

export default config
