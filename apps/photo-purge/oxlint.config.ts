import { defineConfig } from "oxlint"

import nodeConfig from "../../configs/oxlint/oxlint.config.node.ts"
import { restrictedZodImport } from "../../configs/oxlint/shared.ts"

export default defineConfig({
    extends: [nodeConfig],
    ignorePatterns: ["oxlint.config.ts", "vitest.config.ts"],
    rules: {
        "eslint/no-restricted-imports": ["error", { paths: [restrictedZodImport] }],
    },
})
