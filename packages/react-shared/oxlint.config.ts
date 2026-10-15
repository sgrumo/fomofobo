import { defineConfig } from "oxlint"

import reactConfig from "../../configs/oxlint/oxlint.config.react.ts"

export default defineConfig({
    extends: [reactConfig],
    settings: {
        react: {
            version: "19",
        },
    },
    ignorePatterns: ["oxlint.config.ts", "vitest.config.ts"],
})
