import { defineConfig } from "oxlint"

import nodeConfig from "../../configs/oxlint/oxlint.config.node.ts"
import { testFiles, testPlugins } from "../../configs/oxlint/shared.ts"

export default defineConfig({
    extends: [nodeConfig],
    plugins: [...testPlugins],
    ignorePatterns: ["oxlint.config.ts"],
    rules: {
        // custom - jsPlugins
        "custom/no-if-with-expect": "error",

        "vitest/no-hooks": "off",

        // typescript - native
        "typescript/explicit-module-boundary-types": "off",
    },
    overrides: [
        {
            // Global setup and config files
            files: ["setup.ts", "vitest.config.ts"],
            rules: {
                "import/no-default-export": "off",
            },
        },
        {
            // Vitest asymmetric matchers are typed as `any`
            files: testFiles,
            rules: {
                "typescript/no-unsafe-assignment": "off",
            },
        },
    ],
})
