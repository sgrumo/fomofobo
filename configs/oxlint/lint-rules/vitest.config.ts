import { defineConfig } from "vitest/config"

import { anyExtension } from "../../shared.ts"
import { testDefaults } from "../../vitest/vitest.defaults.ts"

export default defineConfig({
    test: {
        ...testDefaults,
        include: [`src/**/*.test.${anyExtension}`],
    },
})
