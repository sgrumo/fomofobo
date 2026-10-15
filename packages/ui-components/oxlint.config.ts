import { defineConfig } from "oxlint"

import reactConfig from "../../configs/oxlint/oxlint.config.react.ts"
import {
    productionFiles,
    restrictedDebugIdentityImport,
    testFiles,
} from "../../configs/oxlint/shared.ts"

const testSetupFiles = ["src/test/setup.ts"]

const barrelFiles = ["src/index.ts"]

export default defineConfig({
    extends: [reactConfig],
    settings: {
        react: {
            version: "19",
        },
    },
    ignorePatterns: ["oxlint.config.ts", "vite.config.ts", "vitest.config.ts"],
    rules: {
        // typescript - native
        "typescript/explicit-module-boundary-types": "off",

        // react - native
        "react/jsx-props-no-spreading": "off",
    },
    overrides: [
        {
            // Production files only override
            files: productionFiles,
            excludeFiles: testFiles,
            rules: {
                "eslint/no-restricted-imports": [
                    "error",
                    { paths: [restrictedDebugIdentityImport] },
                ],
            },
        },
        {
            // Test setup files only override
            files: testSetupFiles,
            rules: {
                "import/no-unassigned-import": "off",
            },
        },
        {
            // Barrel file only override - re-exports a mix of components and types
            files: barrelFiles,
            rules: {
                "react/only-export-components": "off",
            },
        },
    ],
})
