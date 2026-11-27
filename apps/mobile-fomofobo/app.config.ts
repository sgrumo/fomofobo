import { existsSync } from "node:fs"
import path from "node:path"

import { appLinkPathsOf } from "domain/app-links"
import type { ExpoConfig } from "expo/config"
import { languageKeys } from "i18n/i18n"

// The Expo config loader resolves a relative import only with its extension.
import { parseEnv } from "./config/env.ts"
import { withShellProfileable } from "./config/shell-profileable.ts"
import { measuresPerformance, resolveTarget } from "./config/target.ts"
import { withUncompressedSounds } from "./config/uncompressed-sounds.ts"
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
const baseAppId = "it.quinck.zonzo"
const appId = `${baseAppId}${target.appIdSuffix}`

// A shared link points at the origin the app calls, so the app opens the map links of that
// origin. The phone checks the claim against the origin over HTTPS alone.
const apiUrl = URL.canParse(env.API_URL) ? new URL(env.API_URL) : undefined
const appLinkHost = apiUrl?.protocol === "https:" ? apiUrl.host : undefined
const appLinkPaths = appLinkPathsOf(languageKeys)

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
    // SIL Open Font License 1.1, decoded from the woff2 of `packages/styles`: the counts of the map clusters
    countRegular: "./assets/fonts/DepartureMono-Regular.otf",
}

const config: ExpoConfig = {
    extra: {
        appEnv: env.APP_ENV,
        apiUrl: env.API_URL,
        // An unversioned build reports the fallback below, which the version gate reads as a
        // real release. The app then sends no version, so the gate leaves it alone.
        versioned: env.APP_VERSION !== undefined,
    },
    name: "Zonzo",
    slug: "zonzo",
    // Memoizes the components as the web does, so a tap on the map screen re-renders only what
    // it changes, not every marker
    experiments: { reactCompiler: true },
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
        associatedDomains:
            appLinkHost === undefined ? undefined : [`applinks:${appLinkHost}`],
        infoPlist: {
            CFBundleAllowMixedLocalizations: true,
            // HTTPS alone, so App Store Connect asks no export compliance question per build
            ITSAppUsesNonExemptEncryption: false,
            // Maps apps that `installedMapsProvidersOf` probes for the directions picker
            LSApplicationQueriesSchemes: ["comgooglemaps", "waze"],
        },
    },
    android: {
        package: appId,
        versionCode: buildNumber,
        googleServicesFile: googleServicesFile("google-services.json"),
        intentFilters:
            appLinkHost === undefined
                ? undefined
                : [
                      {
                          action: "VIEW",
                          autoVerify: true,
                          data: appLinkPaths.map(appLinkPath => ({
                              scheme: "https",
                              host: appLinkHost,
                              path: appLinkPath,
                          })),
                          category: ["BROWSABLE", "DEFAULT"],
                      },
                  ],
        adaptiveIcon: {
            foregroundImage: "./assets/adaptive-icon.png",
            backgroundColor: THEME_COLORS["map-ground"],
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
                // The first frame of the radar GIF at its size in `SplashRadar`, so the sweep starts where the launch screen stops
                image: "./assets/splash/radar-start.png",
                imageWidth: 240,
                resizeMode: "contain",
                backgroundColor: THEME_COLORS["map-ground"],
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
                        {
                            fontFamily: FONT_FAMILIES.count,
                            fontDefinitions: [
                                { path: fontFiles.countRegular, weight: 400 },
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

export default withUncompressedSounds(
    measuresPerformance(env.APP_ENV) ? withShellProfileable(config) : config,
)
