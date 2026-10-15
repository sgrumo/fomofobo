import { defineConfig } from "oxlint"

import nodeConfig from "../../configs/oxlint/oxlint.config.node.ts"

// Assertion signatures need `function` declarations and condition checks.
const assertionFiles = ["src/assertions.ts"]

// The containers read another process's answers, which need `as` casts.
const containerFiles = ["src/containers.ts"]

// The Playwright reporter interface requires methods, and the logger prints.
const outputFiles = ["src/env.ts", "src/failures-reporter.ts"]

export default defineConfig({
    extends: [nodeConfig],
    ignorePatterns: ["oxlint.config.ts"],
    rules: {
        // eslint - native
        "eslint/init-declarations": "off",

        // typescript - native
        "typescript/explicit-module-boundary-types": "off",
    },
    overrides: [
        {
            files: assertionFiles,
            rules: {
                "typescript/no-unnecessary-condition": "off",
                "eslint/func-style": "off",
            },
        },
        {
            files: containerFiles,
            rules: {
                "typescript/no-unsafe-type-assertion": "off",
            },
        },
        {
            files: outputFiles,
            rules: {
                "eslint/no-console": "off",
                "eslint/class-methods-use-this": "off",
                "eslint/no-control-regex": "off",
                "import/no-default-export": "off",
            },
        },
    ],
})
