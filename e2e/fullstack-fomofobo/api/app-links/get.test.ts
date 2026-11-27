import axios from "axios"
import { expectRawStatus } from "e2e-kit/assertions"
import { publishedAppUrl } from "e2e-kit/env"
import { describe, expect, it } from "vitest"

import { APP_LINKS_ENV } from "../../server"

describe("GET /.well-known/apple-app-site-association", () => {
    it("lets every iOS app open the map path, as JSON at the root path", async () => {
        const res = await axios.get(
            `${publishedAppUrl()}/.well-known/apple-app-site-association`,
            { validateStatus: () => true, maxRedirects: 0 },
        )

        expectRawStatus(res, 200)
        expect(res.headers["content-type"]).toMatch(/^application\/json/u)
        expect(res.data).toStrictEqual({
            applinks: {
                details: [
                    {
                        appIDs: APP_LINKS_ENV.IOS_APP_IDS.split(","),
                        components: [{ "/": "/it/map" }],
                    },
                ],
            },
        })
    })
})

describe("GET /.well-known/assetlinks.json", () => {
    it("lets every Android app signed by a listed key open the links, as JSON at the root path", async () => {
        const res = await axios.get(`${publishedAppUrl()}/.well-known/assetlinks.json`, {
            validateStatus: () => true,
            maxRedirects: 0,
        })

        expectRawStatus(res, 200)
        expect(res.headers["content-type"]).toMatch(/^application\/json/u)
        expect(res.data).toStrictEqual(
            APP_LINKS_ENV.ANDROID_PACKAGES.split(",").map(packageName => ({
                relation: ["delegate_permission/common.handle_all_urls"],
                target: {
                    namespace: "android_app",
                    package_name: packageName,
                    sha256_cert_fingerprints:
                        APP_LINKS_ENV.ANDROID_CERT_FINGERPRINTS.split(","),
                },
            })),
        )
    })
})
