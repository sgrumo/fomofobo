/// <reference types="vitest/config" />
import babel from "@rolldown/plugin-babel"
import react, { reactCompilerPreset } from "@vitejs/plugin-react"
import { defineConfig } from "vitest/config"

import { anyExtension } from "../../configs/shared.ts"
import { testDefaults } from "../../configs/vitest/vitest.defaults.ts"

export default defineConfig({
    plugins: [babel({ presets: [reactCompilerPreset()] }), react()],
    test: {
        ...testDefaults,
        environment: "jsdom",
        include: [`src/**/*.test.${anyExtension}`],
    },
})
