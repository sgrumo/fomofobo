import { configDefaults, defineConfig } from "vitest/config"

import { reportName } from "../../configs/report-name.ts"
import { anyExtension } from "../../configs/shared.ts"
import { testDefaults } from "../../configs/vitest/vitest.defaults.ts"
import { outputOptionsFor } from "../../configs/vitest/vitest.output-options.ts"

export default defineConfig({
    root: import.meta.dirname,
    test: {
        ...testDefaults,
        globalSetup: ["./setup.ts"],
        environment: "node",
        testTimeout: 60_000,
        hookTimeout: 60_000,
        passWithNoTests: false,
        fileParallelism: false,
        ...outputOptionsFor(reportName()),
        include: [`**/*.test.${anyExtension}`],
        exclude: [...configDefaults.exclude],
        globals: false,
    },
})
