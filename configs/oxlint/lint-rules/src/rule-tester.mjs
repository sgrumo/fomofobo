import { RuleTester } from "oxlint/plugins-dev"
import { describe, it } from "vitest"

RuleTester.describe = describe
RuleTester.it = it

/**
 * Runs rule cases through oxlint's RuleTester, parsing every case as TypeScript.
 */
export const ruleTester = new RuleTester({
    languageOptions: { parserOptions: { lang: "ts" } },
})
