import { describe, expect, it } from "vitest"

import { uncompressedSoundsGradle } from "./uncompressed-sounds"

const GRADLE = [
    "android {",
    "    androidResources {",
    "        ignoreAssetsPattern '!.svn'",
    "    }",
    "}",
].join("\n")

describe("uncompressedSoundsGradle", () => {
    it("stores FLAC files uncompressed", () => {
        expect(uncompressedSoundsGradle(GRADLE)).toBe(
            [
                "android {",
                "    androidResources {",
                "        noCompress.add('flac')",
                "        ignoreAssetsPattern '!.svn'",
                "    }",
                "}",
            ].join("\n"),
        )
    })

    it("adds the rule once over repeated runs", () => {
        const once = uncompressedSoundsGradle(GRADLE)
        expect(uncompressedSoundsGradle(once)).toBe(once)
    })

    it("fails on a file with no androidResources block", () => {
        expect(() => uncompressedSoundsGradle("android {\n}")).toThrow(
            "The app build.gradle has no androidResources block",
        )
    })
})
