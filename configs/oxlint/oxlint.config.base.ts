import { defineConfig } from "oxlint"

import {
    basePlugins,
    customPluginPath,
    restrictExclude,
    restrictOmit,
    testFiles,
    testPlugins,
} from "./shared.ts"

export default defineConfig({
    plugins: [...basePlugins],
    jsPlugins: [customPluginPath],
    categories: {
        correctness: "error",
        style: "error",
        perf: "error",
        restriction: "error",
        pedantic: "error",
        suspicious: "error",
    },
    options: {
        denyWarnings: true,
        maxWarnings: 0,
        reportUnusedDisableDirectives: "error",
        respectEslintDisableDirectives: false,
        typeAware: true,
        typeCheck: false,
    },
    rules: {
        // custom - jsPlugins
        "custom/kebab-case-enum-values": "error",

        // oxc - native
        "oxc/no-rest-spread-properties": "off",
        "oxc/no-async-await": "off",
        "oxc/no-optional-chaining": "off",
        "oxc/no-barrel-file": "off",

        // eslint - native
        "eslint/no-continue": "off",
        "eslint/id-length": "off",
        "eslint/no-magic-numbers": "off",
        "eslint/sort-keys": "off",
        "eslint/max-statements": "off",
        "eslint/no-ternary": "off",
        "eslint/no-implicit-coercion": "off",
        "eslint/sort-imports": "off",
        "eslint/no-undefined": "off",
        "eslint/no-bitwise": "off",
        "eslint/no-void": "off",
        "eslint/default-case": "off",
        "eslint/no-await-in-loop": "off",
        "eslint/max-lines-per-function": "off",
        "eslint/no-warning-comments": "off",
        "eslint/complexity": "off",
        "eslint/max-classes-per-file": "off",
        "eslint/max-depth": "off",
        "eslint/max-lines": "off",
        "eslint/max-params": "off",
        "eslint/no-nested-ternary": "off",
        "eslint/no-use-before-define": "off",
        "eslint/one-var": "off",
        "eslint/prefer-destructuring": ["error", { array: true, object: false }],
        "eslint/no-duplicate-imports": ["error", { allowSeparateTypeImports: true }],
        "eslint/no-inner-declarations": ["error", "both"],
        "eslint/capitalized-comments": "off",
        "eslint/no-inline-comments": "off",
        // fires on the const + type companion pattern; tsc catches real redeclarations
        "eslint/no-redeclare": "off",

        // import - native
        "import/prefer-default-export": "off",
        "import/no-named-export": "off",
        "import/group-exports": "off",
        "import/exports-last": "off",
        "import/no-nodejs-modules": "off",
        "import/no-relative-parent-imports": "off",
        "import/unambiguous": "off",
        "import/max-dependencies": "off",
        "import/no-named-as-default-member": "off",
        "import/consistent-type-specifier-style": ["error", "prefer-top-level"],

        // promise - native
        "promise/prefer-await-to-then": "off",
        "promise/prefer-await-to-callbacks": "off",
        "promise/avoid-new": "off",
        "promise/catch-or-return": "off",

        // unicorn - native
        "unicorn/no-null": "off",
        "unicorn/prefer-object-from-entries": "off",
        "unicorn/no-array-reduce": "off",
        "unicorn/prefer-top-level-await": "off",
        "unicorn/no-useless-undefined": "off",
        "unicorn/no-useless-promise-resolve-reject": "off",
        "unicorn/no-array-callback-reference": "off",
        "unicorn/prefer-at": "off",
        "unicorn/no-nested-ternary": "off",
        "unicorn/consistent-function-scoping": "off",
        "unicorn/no-object-as-default-parameter": "off",
        "unicorn/prefer-spread": "off",
        "unicorn/empty-brace-spaces": "off",
        "unicorn/prefer-export-from": "off",
        // fires on idiomatic nested calls (date-fns composition, nested i18n t(), expect chains)
        "unicorn/max-nested-calls": "off",

        // oxfmt lowercases hex literals; this rule demands uppercase. disable to stop the loop.
        "unicorn/number-literal-case": "off",

        "unicorn/no-instanceof-builtins": [
            "error",
            { exclude: ["Function"], strategy: "loose" },
        ],

        // typescript - native
        "typescript/prefer-optional-chain": "off",
        "typescript/explicit-function-return-type": "off",
        "typescript/strict-boolean-expressions": "off",
        "typescript/promise-function-async": "off",
        "typescript/consistent-indexed-object-style": "off",
        "typescript/no-unnecessary-type-arguments": "off",
        "typescript/prefer-readonly-parameter-types": "off",
        "typescript/prefer-readonly": "off",

        // TODO remove once it's out of nursery
        // https://oxc.rs/docs/guide/usage/linter/rules/typescript/no-unnecessary-condition.html
        "typescript/no-unnecessary-condition": "error",

        "typescript/consistent-type-imports": [
            "error",
            { prefer: "type-imports", fixStyle: "separate-type-imports" },
        ],
        "typescript/ban-ts-comment": ["error", { minimumDescriptionLength: 10 }],
        "typescript/restrict-plus-operands": [
            "error",
            {
                allowAny: false,
                allowBoolean: false,
                allowNullish: false,
                allowNumberAndString: false,
                allowRegExp: false,
            },
        ],
        "typescript/return-await": ["error", "error-handling-correctness-only"],
        "typescript/array-type": ["error", { default: "array-simple" }],
        "typescript/no-unused-vars": [
            "error",
            { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
        ],
        "typescript/restrict-template-expressions": [
            "error",
            {
                allow: ["unknown"],
            },
        ],
        "typescript/no-restricted-types": [
            "error",
            { types: { ...restrictOmit, ...restrictExclude } },
        ],
        "typescript/prefer-nullish-coalescing": [
            "error",
            {
                ignorePrimitives: true,
            },
        ],
    },
    overrides: [
        {
            files: testFiles,
            plugins: [...testPlugins],
            rules: {
                "eslint/no-console": "error",

                // vitest - native
                "vitest/prefer-describe-function-title": "off",
                "vitest/prefer-called-times": "off",
                "vitest/prefer-to-be-truthy": "off",
                "vitest/prefer-to-be-falsy": "off",
                "vitest/no-importing-vitest-globals": "off",
                "vitest/require-test-timeout": "off",
                "vitest/max-expects": "off",
                "vitest/prefer-expect-assertions": "off",
                "vitest/prefer-lowercase-title": "off",
                "vitest/prefer-expect-resolves": "off",
                "vitest/prefer-called-with": "off",
                "vitest/no-hooks": "off",
            },
        },
    ],
})
