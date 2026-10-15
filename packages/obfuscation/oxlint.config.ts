import { defineConfig } from "oxlint"

import nodeConfig from "../../configs/oxlint/oxlint.config.node.ts"
import webConfig from "../../configs/oxlint/oxlint.config.web.ts"

export default defineConfig({
    extends: [nodeConfig, webConfig],
    ignorePatterns: ["oxlint.config.ts", "vitest.config.ts"],
})
