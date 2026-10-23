import { defineConfig } from "oxlint"

import reactConfig from "../../configs/oxlint/oxlint.config.react.ts"
import { productionFiles, testFiles } from "../../configs/oxlint/shared.ts"
import { anyExtension } from "../../configs/shared.ts"

const declarationFiles = ["**/*.d.ts"]

const routeFiles = [`src/app/**/*.${anyExtension}`]

const entryLayoutFiles = ["src/app/_layout.tsx"]

// Both run in node - the expo config and the test that loads it
const configFiles = ["app.config.ts", "app.config.test.ts"]

const uiFiles = [`src/components/ui/**/*.${anyExtension}`]

export default defineConfig({
    extends: [reactConfig],
    ignorePatterns: [
        "oxlint.config.ts",
        "vitest.config.ts",
        "metro.config.cjs",
        "babel.config.cjs",
        "tailwind.config.cjs",
    ],
    settings: {
        react: {
            version: "19",
        },
    },
    rules: {
        // typescript - native
        "typescript/explicit-module-boundary-types": "off",

        // react - native
        // no HTML elements or Link in RN, so no exceptions to grant
        "react/jsx-props-no-spreading": "error",

        // no HTML buttons in RN
        "react/button-has-type": "off",

        // jsx-a11y - native
        // requires aria-controls on combobox, which RN has no equivalent for
        // (it maps no native accessibility relationship)
        "jsx-a11y/role-has-required-aria-props": "off",
    },
    overrides: [
        {
            files: productionFiles,
            excludeFiles: testFiles,
            rules: {
                // RN ships polyfills for several node builtins
                "import/no-nodejs-modules": "off",
            },
        },
        {
            files: declarationFiles,
            rules: {
                "import/no-unassigned-import": "off",
            },
        },
        {
            files: routeFiles,
            rules: {
                "import/no-default-export": "off",
            },
        },
        {
            files: entryLayoutFiles,
            rules: {
                "import/no-unassigned-import": "off",
            },
        },
        {
            files: configFiles,
            rules: {
                "import/no-default-export": "off",

                // runs in node at prebuild time, not in the RN runtime
                "import/no-nodejs-modules": "off",
            },
        },
        {
            files: uiFiles,
            rules: {
                "react/jsx-props-no-spreading": "off",
                "react/only-export-components": "off",
                "import/no-namespace": "off",
                "typescript/no-unsafe-type-assertion": "off",
            },
        },
    ],
})
