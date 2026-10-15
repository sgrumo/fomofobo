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
        "custom/prefer-expect-status": "error",

        // vitest - native
        "vitest/expect-expect": [
            "error",
            {
                assertFunctionNames: [
                    "expect",
                    "expectStatus",
                    "expectApiError",
                    "expectRawStatus",
                    "expectToBeDefined",
                ],
            },
        ],
        "vitest/no-hooks": "off",
        "vitest/no-conditional-in-test": "off",

        // eslint - native
        "eslint/init-declarations": "off",

        // typescript - native
        "typescript/explicit-module-boundary-types": "off",
    },
    overrides: [
        {
            // `defineUiSamplesTests` registers Playwright tests, which vitest does not know
            files: ["ui/tests/ui-samples.test.ts"],
            rules: {
                "vitest/require-hook": "off",
            },
        },
        {
            // The API clients cast the answers of another process
            files: ["api/**/api.ts"],
            rules: {
                "typescript/no-unsafe-type-assertion": "off",
            },
        },
        {
            // Global setup and config files
            files: ["*/setup.ts", "api/vitest.config.ts", "ui/playwright.config.ts"],
            rules: {
                "import/no-default-export": "off",
            },
        },
        {
            // The UI specs take Playwright's `expect`, not vitest's
            files: ["ui/**/*.ts"],
            rules: {
                "vitest/prefer-importing-vitest-globals": "off",
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
