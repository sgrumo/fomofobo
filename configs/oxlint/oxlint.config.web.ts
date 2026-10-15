import { defineConfig } from "oxlint"

import baseConfig from "./oxlint.config.base.ts"

export default defineConfig({
    extends: [baseConfig],
    rules: {
        // eslint - native
        "eslint/no-console": ["error", { allow: ["warn", "error"] }],

        // import - native
        "import/no-nodejs-modules": "error",
    },
})
