import { defineConfig } from "oxlint"

import nodeConfig from "../../configs/oxlint/oxlint.config.node.ts"
import { productionFiles, testFiles } from "../../configs/oxlint/shared.ts"

export default defineConfig({
    extends: [nodeConfig],
    ignorePatterns: ["oxlint.config.ts"],
    overrides: [
        {
            // Production files only override
            files: productionFiles,
            excludeFiles: testFiles,
            rules: {
                "eslint/no-console": "off",
            },
        },
    ],
})
