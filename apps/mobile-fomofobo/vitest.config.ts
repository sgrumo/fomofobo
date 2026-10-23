import { defineConfig } from "vitest/config"

import { anyExtension } from "../../configs/shared.ts"
import { testDefaults } from "../../configs/vitest/vitest.defaults.ts"

export default defineConfig({
    test: {
        ...testDefaults,
        include: [
            `app.config.test.${anyExtension}`,
            `config/**/*.test.${anyExtension}`,
            `src/**/*.test.${anyExtension}`,
        ],
    },
})
