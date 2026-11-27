import { describe, expect, it } from "vitest"

import { appSiteAssociationOf, assetLinksOf } from "./app-links"

const fingerprint = Array.from({ length: 32 }, () => "AB").join(":")

describe("appSiteAssociationOf", () => {
    it("should let every app open every path", () => {
        expect(
            appSiteAssociationOf(
                ["ABCDE12345.it.example.app", "ABCDE12345.it.example.app.dev"],
                ["/it/map", "/en/map"],
            ),
        ).toStrictEqual({
            applinks: {
                details: [
                    {
                        appIDs: [
                            "ABCDE12345.it.example.app",
                            "ABCDE12345.it.example.app.dev",
                        ],
                        components: [{ "/": "/it/map" }, { "/": "/en/map" }],
                    },
                ],
            },
        })
    })

    it("should list no detail without an app", () => {
        expect(appSiteAssociationOf([], ["/it/map"])).toStrictEqual({
            applinks: { details: [] },
        })
    })
})

describe("assetLinksOf", () => {
    it("should build one statement per package, with every fingerprint", () => {
        expect(
            assetLinksOf(["it.example.app", "it.example.app.dev"], [fingerprint]),
        ).toStrictEqual(
            ["it.example.app", "it.example.app.dev"].map(packageName => ({
                relation: ["delegate_permission/common.handle_all_urls"],
                target: {
                    namespace: "android_app",
                    package_name: packageName,
                    sha256_cert_fingerprints: [fingerprint],
                },
            })),
        )
    })

    it("should build no statement without a fingerprint", () => {
        expect(assetLinksOf(["it.example.app"], [])).toStrictEqual([])
    })
})
