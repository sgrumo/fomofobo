import { defineConfig } from "oxlint"

import nodeConfig from "../oxlint.config.node.ts"
import { testFiles, testPlugins } from "../shared.ts"

export default defineConfig({
    extends: [nodeConfig],
    ignorePatterns: ["oxlint.config.ts", "vitest.config.ts"],
    // Oxlint exports no plugin or AST types, so type-aware rules see every node as `any`
    options: { typeAware: false },
    rules: {
        // A plugin must default-export its rule map
        "import/no-default-export": "off",
    },
    overrides: [
        {
            // RuleTester registers its cases at module scope
            files: testFiles,
            plugins: [...testPlugins],
            rules: {
                "vitest/require-hook": "off",
            },
        },
    ],
})
