import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs"
import path from "node:path"

import { languageKeys } from "i18n/i18n"
import { describe, expect, it, vi } from "vitest"

import config from "./app.config"

const soundBundleId = /^[a-z][a-z0-9]*(?:\.[a-z][a-z0-9]*)+$/iu

/**
 * @description Returns the config from a fresh import
 * @remarks Resets the module registry, so the config reads the current environment
 */
const loadConfig = async () => {
    vi.resetModules()
    const reloaded = await import("./app.config")
    return reloaded.default
}

/**
 * @description Runs the callback with a placeholder native Firebase config in place
 * @param relativePath Repo-relative path of the config file
 * @param run Callback run while the file exists
 * @remarks Leaves a file that already existed untouched, so a developer keeps their own
 */
const withFirebaseConfig = async (relativePath: string, run: () => Promise<void>) => {
    const absolute = path.join(process.cwd(), relativePath)
    const preexisting = existsSync(absolute)
    if (!preexisting) {
        mkdirSync(path.dirname(absolute), { recursive: true })
        writeFileSync(absolute, "{}")
    }
    try {
        await run()
    } finally {
        if (!preexisting) {
            rmSync(absolute)
        }
    }
}

/**
 * @description Returns the config a given APP_ENV produces
 * @param appEnv Value stubbed onto APP_ENV before the reload
 * @remarks Stubs API_URL too, which dev and prod require
 */
const loadConfigFor = (appEnv: string) => {
    vi.stubEnv("APP_ENV", appEnv)
    vi.stubEnv("API_URL", "https://api.example.com")
    return loadConfig()
}

describe("app.config", () => {
    it("declares the app languages for iOS only", () => {
        expect(config.plugins).toContainEqual([
            "expo-localization",
            { supportedLocales: { ios: [...languageKeys] } },
        ])
        expect(config.ios?.infoPlist?.CFBundleAllowMixedLocalizations).toBe(true)
    })

    it("enables R8 and resource shrinking on Android release builds", () => {
        expect(config.plugins).toContainEqual([
            "expo-build-properties",
            {
                android: {
                    enableMinifyInReleaseBuilds: true,
                    enableShrinkResourcesInReleaseBuilds: true,
                },
            },
        ])
    })

    it("declares a sound iOS bundle identifier", () => {
        expect(config.ios?.bundleIdentifier).toMatch(soundBundleId)
    })

    it("declares a sound Android package name", () => {
        expect(config.android?.package).toMatch(soundBundleId)
    })

    // A tester build installs beside the store build only under its own application id.
    it("suffixes both application ids on a dev build", async () => {
        const prod = await loadConfigFor("prod")
        const dev = await loadConfigFor("dev")
        expect(dev.ios?.bundleIdentifier).toBe(`${prod.ios?.bundleIdentifier}.dev`)
        expect(dev.android?.package).toBe(`${prod.android?.package}.dev`)
    })

    it("keeps the dev application ids sound", async () => {
        const dev = await loadConfigFor("dev")
        expect(dev.ios?.bundleIdentifier).toMatch(soundBundleId)
        expect(dev.android?.package).toMatch(soundBundleId)
    })

    // One scheme across two installed apps makes deep link resolution arbitrary. The values
    // are pinned, not only compared: a native project already holds them, and a rename
    // silently breaks every deep link already in the wild.
    it("gives a dev build its own scheme", async () => {
        const prod = await loadConfigFor("prod")
        const dev = await loadConfigFor("dev")
        expect(prod.scheme).toBe("fomofobo")
        expect(dev.scheme).toBe("fomofobodev")
    })

    it("takes the release version from APP_VERSION", async () => {
        vi.stubEnv("APP_VERSION", "1.2.0")
        const released = await loadConfig()
        expect(released.version).toBe("1.2.0")
    })

    // The store lanes override this, but the App Distribution lane relies on it: Android
    // refuses to install an APK whose code is not above the installed one.
    it("takes the Android versionCode from APP_BUILD_NUMBER", async () => {
        vi.stubEnv("APP_BUILD_NUMBER", "42")
        const released = await loadConfig()
        expect(released.android?.versionCode).toBe(42)
        expect(released.ios?.buildNumber).toBe("42")
    })

    it("falls back to versionCode 1 when APP_BUILD_NUMBER is unset", async () => {
        vi.stubEnv("APP_BUILD_NUMBER", undefined)
        const released = await loadConfig()
        expect(released.android?.versionCode).toBe(1)
    })

    it("passes the environment and the API URL to the app", async () => {
        const released = await loadConfigFor("dev")
        expect(released.extra?.appEnv).toBe("dev")
        expect(released.extra?.apiUrl).toBe("https://api.example.com")
    })

    it("falls back to version 1.0.0 when APP_VERSION is unset", async () => {
        vi.stubEnv("APP_VERSION", undefined)
        const released = await loadConfig()
        expect(released.version).toBe("1.0.0")
    })

    it("marks the build versioned when APP_VERSION is set", async () => {
        vi.stubEnv("APP_VERSION", "1.2.0")
        const released = await loadConfig()
        expect(released.extra?.versioned).toBe(true)
    })

    it("marks the build unversioned when APP_VERSION is unset", async () => {
        vi.stubEnv("APP_VERSION", undefined)
        const released = await loadConfig()
        expect(released.extra?.versioned).toBe(false)
    })

    // dev and prod are separate Firebase projects. A dev build reaching the prod config
    // would send tester traffic to the production project, silently.
    it("points a dev build at the dev Firebase config", async () => {
        await withFirebaseConfig("firebase/dev/GoogleService-Info.plist", async () => {
            await withFirebaseConfig("firebase/dev/google-services.json", async () => {
                const released = await loadConfigFor("dev")
                expect(released.ios?.googleServicesFile).toBe(
                    "./firebase/dev/GoogleService-Info.plist",
                )
                expect(released.android?.googleServicesFile).toBe(
                    "./firebase/dev/google-services.json",
                )
            })
        })
    })

    it("points a production build at the prod Firebase config", async () => {
        await withFirebaseConfig("firebase/prod/GoogleService-Info.plist", async () => {
            await withFirebaseConfig("firebase/prod/google-services.json", async () => {
                const released = await loadConfigFor("prod")
                expect(released.ios?.googleServicesFile).toBe(
                    "./firebase/prod/GoogleService-Info.plist",
                )
                expect(released.android?.googleServicesFile).toBe(
                    "./firebase/prod/google-services.json",
                )
            })
        })
    })

    // The app has no Firebase SDK and no build needs the file, so a missing file must drop
    // the key rather than point prebuild at a path that does not exist.
    it("omits googleServicesFile when the file is absent", async () => {
        const released = await loadConfigFor("dev")
        expect(released.ios?.googleServicesFile).toBeUndefined()
        expect(released.android?.googleServicesFile).toBeUndefined()
    })
})
