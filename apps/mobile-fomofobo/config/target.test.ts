import { describe, expect, it } from "vitest"

import { appEnvValues, measuresPerformance, resolveTarget } from "./target"

describe("resolveTarget", () => {
    it("keeps the store identity for prod alone", () => {
        expect(
            appEnvValues.filter(appEnv => resolveTarget(appEnv).appIdSuffix === ""),
        ).toStrictEqual(["prod"])
    })

    // A local build installs beside the store app, never over it.
    it("gives a local build the dev identity", () => {
        expect(resolveTarget("local")).toStrictEqual(resolveTarget("dev"))
    })

    // dev and prod are separate Firebase projects, so their config files never overlap.
    it("gives prod its own Firebase config", () => {
        expect(resolveTarget("prod").firebaseDir).not.toBe(
            resolveTarget("dev").firebaseDir,
        )
    })
})

describe("measuresPerformance", () => {
    it("measures every build but the store build", () => {
        expect(appEnvValues.filter(appEnv => !measuresPerformance(appEnv))).toStrictEqual(
            ["prod"],
        )
    })
})
