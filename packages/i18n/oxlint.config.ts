import { defineConfig } from "oxlint"

import webConfig from "../../configs/oxlint/oxlint.config.web.ts"
import { anyExtension } from "../../configs/shared.ts"

const nodeFiles = [`src/tests/**/*.${anyExtension}`]

export default defineConfig({
    extends: [webConfig],
    ignorePatterns: ["oxlint.config.ts", "vitest.config.ts"],
    overrides: [
        {
            files: nodeFiles,
            rules: {
                "import/no-nodejs-modules": "off",
            },
        },
    ],
})
