import "server-only"
import { appLinkPathsOf } from "domain/app-links"
import { languageKeys } from "i18n/i18n"

import { parseEnv } from "./env"

/**
 * @description Builds the Apple App Site Association document, which lets the iOS apps open
 * the map links of this origin
 * @param appIds Team id and bundle id of each iOS app
 * @param paths Paths the apps open
 */
export const appSiteAssociationOf = (appIds: string[], paths: string[]) => ({
    applinks: {
        details:
            appIds.length === 0
                ? []
                : [{ appIDs: appIds, components: paths.map(path => ({ "/": path })) }],
    },
})

/**
 * @description Builds the Digital Asset Links statements, which let the Android apps open the
 * map links of this origin
 * @param packages Package name of each Android app
 * @param fingerprints SHA-256 fingerprints of the certificates that sign the apps
 * @remarks Returns no statement without a fingerprint: Android verifies none
 */
export const assetLinksOf = (packages: string[], fingerprints: string[]) =>
    fingerprints.length === 0
        ? []
        : packages.map(packageName => ({
              relation: ["delegate_permission/common.handle_all_urls"],
              target: {
                  namespace: "android_app",
                  package_name: packageName,
                  sha256_cert_fingerprints: fingerprints,
              },
          }))

/**
 * @description Builds the documents that let the native apps of this environment open its map
 * links
 * @throws When the environment misses a variable of its `APP_ENV` variant
 */
export const appLinkDocuments = () => {
    const env = parseEnv(process.env)
    return {
        appSiteAssociation: appSiteAssociationOf(
            env.IOS_APP_IDS ?? [],
            appLinkPathsOf(languageKeys),
        ),
        assetLinks: assetLinksOf(
            env.ANDROID_PACKAGES ?? [],
            env.ANDROID_CERT_FINGERPRINTS ?? [],
        ),
    }
}
