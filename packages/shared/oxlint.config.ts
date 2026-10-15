import { defineConfig } from "oxlint"

import nodeConfig from "../../configs/oxlint/oxlint.config.node.ts"
import webConfig from "../../configs/oxlint/oxlint.config.web.ts"

const debugHelperFiles = ["src/debug.ts"]

const typeLevelTestFiles = ["src/types.test.ts"]

const strictTypeAliasFiles = ["src/types.ts", "src/types.test.ts"]

const zodMirrorFiles = ["src/zod.ts"]

export default defineConfig({
    extends: [nodeConfig, webConfig],
    ignorePatterns: ["oxlint.config.ts", "vite.config.ts", "vitest.config.ts"],
    overrides: [
        {
            // Debug helper files only override
            files: debugHelperFiles,
            rules: {
                "eslint/no-console": "off",
            },
        },
        {
            // Type-level test files only override
            files: typeLevelTestFiles,
            rules: {
                "typescript/consistent-type-definitions": "off",
            },
        },
        {
            files: strictTypeAliasFiles,
            rules: {
                "typescript/no-restricted-types": "off",
            },
        },
        {
            // Enums mirroring Zod literals keep the Zod spelling
            files: zodMirrorFiles,
            rules: {
                "custom/kebab-case-enum-values": "off",
            },
        },
    ],
})
