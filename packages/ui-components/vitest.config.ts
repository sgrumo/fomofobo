/// <reference types="vitest/config" />
import babel from "@rolldown/plugin-babel"
import react, { reactCompilerPreset } from "@vitejs/plugin-react"
import { defineConfig } from "vitest/config"

import { anyExtension } from "../../configs/shared.ts"
import { testDefaults } from "../../configs/vitest/vitest.defaults.ts"
export default defineConfig({
    test: {
        ...testDefaults,
        environment: "jsdom",
        setupFiles: [`./src/test/setup.ts`],
        include: [`src/**/*.test.${anyExtension}`],
    },
    plugins: [babel({ presets: [reactCompilerPreset()] }), react()],
    resolve: {
        tsconfigPaths: true,
    },
})
