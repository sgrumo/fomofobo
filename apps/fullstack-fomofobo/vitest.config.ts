import { fileURLToPath } from "node:url"

import { defineConfig } from "vitest/config"

import { anyExtension } from "../../configs/shared.ts"
import { testDefaults } from "../../configs/vitest/vitest.defaults.ts"

export default defineConfig({
    resolve: {
        // Mirrors the `@/*` path of `tsconfig.json`, which Next resolves on its own.
        alias: {
            "@": fileURLToPath(new URL("./src", import.meta.url)),
        },
    },
    test: {
        ...testDefaults,
        include: [`src/**/*.test.${anyExtension}`],
        setupFiles: ["./vitest.setup.ts"],
    },
})
