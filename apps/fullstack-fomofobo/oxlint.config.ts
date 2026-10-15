import { defineConfig } from "oxlint"

import reactConfig from "../../configs/oxlint/oxlint.config.react.ts"
import {
    nextConventionFiles,
    nextPlugins,
    productionFiles,
    restrictedCreateUseWebStorageImport,
    restrictedCreateWebStorageImport,
    restrictedDebugIdentityImport,
    testFiles,
} from "../../configs/oxlint/shared.ts"
import { anyExtension } from "../../configs/shared.ts"

// A folder named `server` holds server modules. Each one opens with `import "server-only"`.
const serverModuleFiles = [`src/**/server/**/*.${anyExtension}`]
const declarationFiles = ["**/*.d.ts"]
// Client components of one page. The only files that read the route hooks.
const routeClientComponentFiles = [`src/app/**/_page/client/**/*.${anyExtension}`]
// Client components shared by pages and layouts. No route of their own.
const sharedClientComponentFiles = [`src/components/client/**/*.${anyExtension}`]
const routeFrameworkFiles = [`src/framework/routes/**/*.${anyExtension}`]

const restrictedSharedImports = [
    restrictedDebugIdentityImport,
    restrictedCreateUseWebStorageImport,
    restrictedCreateWebStorageImport,
]

const restrictedServerModuleImport = {
    regex: "(^|/)server/",
    allowTypeImports: true,
    message:
        "A client component never imports a server module. Render it from the page and pass the result as a prop.",
}

const restrictedRouteHooksImport = {
    regex: "/route-hooks/",
    message:
        "Only a client component under `_page/client` reads the route hooks, with `routes[props.route]` as the route.",
}

export default defineConfig({
    extends: [reactConfig],
    plugins: [...nextPlugins],
    settings: {
        react: {
            version: "19",
        },
    },
    ignorePatterns: [
        "oxlint.config.ts",
        "next.config.ts",
        "open-next.config.ts",
        "postcss.config.mjs",
        "vitest.config.ts",
        "vitest.setup.ts",
        ".next",
        ".open-next",
    ],
    rules: {
        // typescript - native
        "typescript/explicit-module-boundary-types": "off",

        // import - native
        // `server-only` is a side-effect marker: it throws when a client bundle includes the module.
        "import/no-unassigned-import": ["error", { allow: ["server-only"] }],
    },
    overrides: [
        {
            // Production files only override
            files: productionFiles,
            excludeFiles: testFiles,
            rules: {
                "eslint/no-restricted-imports": [
                    "error",
                    {
                        paths: restrictedSharedImports,
                        patterns: [restrictedRouteHooksImport],
                    },
                ],
            },
        },
        {
            // Route client component files only override
            files: routeClientComponentFiles,
            excludeFiles: testFiles,
            rules: {
                "eslint/no-restricted-imports": [
                    "error",
                    {
                        paths: restrictedSharedImports,
                        patterns: [restrictedServerModuleImport],
                    },
                ],
            },
        },
        {
            // Shared client component files only override
            files: sharedClientComponentFiles,
            excludeFiles: testFiles,
            rules: {
                "eslint/no-restricted-imports": [
                    "error",
                    {
                        paths: restrictedSharedImports,
                        patterns: [
                            restrictedServerModuleImport,
                            restrictedRouteHooksImport,
                        ],
                    },
                ],
            },
        },
        {
            // Route framework files only override
            files: routeFrameworkFiles,
            excludeFiles: testFiles,
            rules: {
                "eslint/no-restricted-imports": [
                    "error",
                    { paths: restrictedSharedImports },
                ],
            },
        },
        {
            // Test files only override
            files: testFiles,
            rules: {
                "react/jsx-props-no-spreading": "off",
                "import/no-nodejs-modules": "off",
            },
        },
        {
            // Next convention files only override
            files: nextConventionFiles,
            rules: {
                "import/no-default-export": "off",
                "import/no-unassigned-import": "off",
                // Next reads `metadata`, `dynamic` and `runtime` from these files
                // alongside the default export.
                "react/only-export-components": "off",
            },
        },
        {
            // Server module files only override
            files: serverModuleFiles,
            excludeFiles: testFiles,
            rules: {
                "custom/require-server-only": "error",
            },
        },
        {
            // Declaration files only override
            files: declarationFiles,
            rules: {
                "import/no-unassigned-import": "off",
            },
        },
    ],
})
