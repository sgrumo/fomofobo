import { defineConfig } from "oxlint"

import nodeConfig from "../../configs/oxlint/oxlint.config.node.ts"

export default defineConfig({
    extends: [nodeConfig],
    ignorePatterns: [
        "drizzle.config.ts",
        "drizzle.migrate.config.ts",
        "oxlint.config.ts",
    ],
})
