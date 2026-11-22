import { withAndroidManifest } from "expo/config-plugins.js"
import type { AndroidConfig, ConfigPlugin } from "expo/config-plugins.js"

type ManifestApplication = AndroidConfig.Manifest.ManifestApplication

interface ProfileableApplication extends ManifestApplication {
    profileable: Array<{ $: { "android:shell": "true" } }>
}

/**
 * @description Returns the application element with a `profileable` child open to the shell, so the Android Studio profiler attaches to a release build
 * @param application Application element of the manifest
 */
export const shellProfileableOf = (
    application: ManifestApplication,
): ProfileableApplication => ({
    ...application,
    profileable: [{ $: { "android:shell": "true" } }],
})

/**
 * @description Lets the Android Studio profiler and Perfetto record a release build
 * @param config Expo config
 * @remarks Belongs to a measuring build alone: a store build stays closed to the shell
 */
export const withShellProfileable: ConfigPlugin = config =>
    withAndroidManifest(config, android => ({
        ...android,
        modResults: {
            ...android.modResults,
            manifest: {
                ...android.modResults.manifest,
                application:
                    android.modResults.manifest.application?.map(shellProfileableOf),
            },
        },
    }))
