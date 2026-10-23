import { defineConfig } from "vitest/config"

import { anyExtension } from "../../configs/shared.ts"
import { testDefaults } from "../../configs/vitest/vitest.defaults.ts"

export default defineConfig({
    test: {
        ...testDefaults,
        detectAsyncLeaks: true,
        include: [`src/**/*.test.${anyExtension}`],
    },
})
