import { defineConfig } from "oxlint"

import nodeConfig from "../../configs/oxlint/oxlint.config.node.ts"
import webConfig from "../../configs/oxlint/oxlint.config.web.ts"
import { restrictedZodImport } from "../../configs/oxlint/shared.ts"

export default defineConfig({
    extends: [nodeConfig, webConfig],
    ignorePatterns: ["oxlint.config.ts", "vitest.config.ts"],
    rules: {
        "eslint/no-restricted-imports": ["error", { paths: [restrictedZodImport] }],
    },
})
