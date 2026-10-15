import { defineConfig } from "oxlint"

import webConfig from "../../configs/oxlint/oxlint.config.web.ts"

export default defineConfig({
    extends: [webConfig],
    ignorePatterns: ["oxlint.config.ts"],
})
