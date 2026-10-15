import { defineConfig } from "oxlint"

import webConfig from "../../configs/oxlint/oxlint.config.web.ts"
import { restrictedZodImport } from "../../configs/oxlint/shared.ts"

export default defineConfig({
    extends: [webConfig],
    ignorePatterns: ["oxlint.config.ts", "vitest.config.ts"],
    rules: {
        // typescript - native
        "typescript/explicit-module-boundary-types": "off",

        "eslint/no-restricted-imports": ["error", { paths: [restrictedZodImport] }],
    },
})
