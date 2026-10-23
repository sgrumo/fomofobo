import {
    findInterpolationMismatches,
    findNamespaceMismatches,
    findShapeMismatches,
    readLocales,
} from "i18n/tests"
import { describe, expect, it } from "vitest"

import { namespaces } from "./resources"

const locales = readLocales(new URL("../../locales/", import.meta.url))

describe("locale files", () => {
    it("match the declared namespaces", () => {
        expect(findNamespaceMismatches(locales, namespaces)).toStrictEqual({
            missing: [],
            undeclared: [],
        })
    })

    it("share one key structure across languages", () => {
        expect(findShapeMismatches(locales)).toStrictEqual([])
    })

    it("share interpolations across languages", () => {
        expect(findInterpolationMismatches(locales)).toStrictEqual([])
    })
})
