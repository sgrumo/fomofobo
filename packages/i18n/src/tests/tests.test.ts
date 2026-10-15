import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"

import { afterAll, beforeAll, describe, expect, it } from "vitest"

import {
    findInterpolationMismatches,
    findMissingFormIssueKeys,
    findNamespaceMismatches,
    findShapeMismatches,
    readLocales,
} from "./tests"

const root = mkdtempSync(path.join(tmpdir(), "i18n-tests-"))

/**
 * @description Persists one namespace file of a language into the fixture root
 * @param lang Language directory name
 * @param namespace Namespace file name, without the extension
 * @param content Nested translations written
 */
const writeNamespace = (lang: string, namespace: string, content: unknown) => {
    mkdirSync(path.join(root, lang), { recursive: true })
    writeFileSync(path.join(root, lang, `${namespace}.json`), JSON.stringify(content))
}

describe("locale checks", () => {
    beforeAll(() => {
        writeNamespace("en", "shared", {
            Hello: "Hello {{name}}",
            OnlyEn: "English only",
            Nested: { Deep: "Deep" },
        })
        writeNamespace("it", "shared", {
            Hello: "Ciao {{nome}}",
            OnlyIt: "Solo italiano",
            Nested: { Deep: "Profondo" },
        })
        writeNamespace("en", "ui", { FormErrors: { Required: "Required" } })
        writeNamespace("it", "ui", { FormErrors: { Required: "Obbligatorio" } })
    })

    afterAll(() => {
        rmSync(root, { recursive: true, force: true })
    })

    describe("readLocales", () => {
        it("reads sorted languages and namespaces with flat translations", () => {
            const locales = readLocales(root)

            expect(locales.languages).toStrictEqual(["en", "it"])
            expect(locales.namespaces).toStrictEqual(["shared", "ui"])
            expect(locales.flat.en?.shared).toStrictEqual({
                Hello: "Hello {{name}}",
                OnlyEn: "English only",
                "Nested.Deep": "Deep",
            })
        })

        it("accepts a file URL", () => {
            const locales = readLocales(new URL(`file://${root}/`))
            expect(locales.languages).toStrictEqual(["en", "it"])
        })
    })

    describe("findShapeMismatches", () => {
        it("reports missing and extra keys against the reference language", () => {
            expect(findShapeMismatches(readLocales(root))).toStrictEqual([
                {
                    namespace: "shared",
                    language: "it",
                    missingKeys: ["OnlyEn"],
                    extraKeys: ["OnlyIt"],
                },
            ])
        })
    })

    describe("findNamespaceMismatches", () => {
        it("reports declared namespaces absent from disk and undeclared ones", () => {
            expect(
                findNamespaceMismatches(readLocales(root), ["shared", "files"]),
            ).toStrictEqual({ missing: ["files"], undeclared: ["ui"] })
        })

        it("returns empty lists when declared and on-disk namespaces match", () => {
            expect(
                findNamespaceMismatches(readLocales(root), ["ui", "shared"]),
            ).toStrictEqual({
                missing: [],
                undeclared: [],
            })
        })
    })

    describe("findInterpolationMismatches", () => {
        it("reports keys whose interpolations differ", () => {
            expect(findInterpolationMismatches(readLocales(root))).toStrictEqual([
                {
                    namespace: "shared",
                    language: "it",
                    key: "Hello",
                    reference: ["{{name}}"],
                    actual: ["{{nome}}"],
                },
            ])
        })
    })

    describe("findMissingFormIssueKeys", () => {
        it("lists every form issue key the reference language lacks", () => {
            const missing = findMissingFormIssueKeys(readLocales(root))

            expect(missing).not.toContain("FormErrors.Required")
            expect(missing).toContain("FormErrors.InvalidValue")
        })
    })
})
