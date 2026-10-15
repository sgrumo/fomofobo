import { defineConfig } from "oxlint"

import reactConfig from "../../configs/oxlint/oxlint.config.react.ts"
import {
    productionFiles,
    restrictedDebugIdentityImport,
    testFiles,
} from "../../configs/oxlint/shared.ts"

export default defineConfig({
    extends: [reactConfig],
    settings: {
        react: {
            version: "19",
        },
    },
    ignorePatterns: ["oxlint.config.ts"],
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
    ],
})
