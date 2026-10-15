import { describe, expect, it } from "vitest"

import plugin from "./custom-rules.mjs"

describe("custom-rules", () => {
    it("names the plugin so rules resolve under the custom prefix", () => {
        expect(plugin.meta.name).toBe("custom")
    })

    it("registers every rule under its kebab-case name", () => {
        expect(Object.keys(plugin.rules).toSorted()).toStrictEqual([
            "kebab-case-enum-values",
            "no-if-with-expect",
            "prefer-expect-status",
            "require-server-only",
        ])
    })

    it("registers a rule object with a create method for every name", () => {
        const invalid = Object.entries(plugin.rules).filter(
            ([, rule]) => typeof rule?.create !== "function",
        )
        expect(invalid.map(([name]) => name)).toStrictEqual([])
    })
})
