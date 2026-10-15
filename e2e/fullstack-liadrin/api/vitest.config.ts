import { configDefaults, defineConfig } from "vitest/config"

import { reportName } from "../../../configs/report-name.ts"
import { anyExtension } from "../../../configs/shared.ts"
import { testDefaults } from "../../../configs/vitest/vitest.defaults.ts"
import { outputOptionsFor } from "../../../configs/vitest/vitest.output-options.ts"

export default defineConfig({
    // The package runs two suites, so the root is this directory, not the cwd.
    root: import.meta.dirname,
    test: {
        ...testDefaults,
        setupFiles: ["e2e-kit/vitest-reset"],
        globalSetup: ["./setup.ts"],
        environment: "node",
        testTimeout: 60_000,
        hookTimeout: 60_000,
        passWithNoTests: false,
        fileParallelism: false,
        ...outputOptionsFor(reportName("api")),
        include: [`**/*.test.${anyExtension}`],
        exclude: [...configDefaults.exclude],
        globals: false,
    },
    server: {
        watch: {
            ignored: ["**/node_modules/**", "**/dist/**"],
        },
    },
})
