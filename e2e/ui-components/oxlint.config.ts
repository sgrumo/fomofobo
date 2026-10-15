import { defineConfig } from "oxlint"

import nodeConfig from "../../configs/oxlint/oxlint.config.node.ts"
import { testPlugins } from "../../configs/oxlint/shared.ts"

export default defineConfig({
    extends: [nodeConfig],
    plugins: [...testPlugins],
    ignorePatterns: ["oxlint.config.ts"],
    rules: {
        // custom - jsPlugins
        "custom/no-if-with-expect": "error",

        // The helpers take Playwright's `expect`, not vitest's
        "vitest/prefer-importing-vitest-globals": "off",
        "vitest/no-hooks": "off",

        // typescript - native
        "typescript/explicit-module-boundary-types": "off",
    },
})
