import os from "node:os"
import path from "node:path"

import { defineConfig, devices } from "@playwright/test"

import { APP_URL_ENV, env, reportName } from "./env"
import { ROOT_DIR } from "./infra"

export interface PlaywrightSuiteOptions {
    /** Directory of the suite config. Every path below resolves from it. */
    dir: string
    /** Runner of a suite with two runners, appended to the report name. */
    runner?: string
    /** Test file globs skipped. */
    testIgnore?: string[]
}

/**
 * @description Builds the Playwright config of a suite, with `tests/` and `setup.ts` beside the config
 * @param options Suite directory, runner and skipped globs
 * @remarks Reads `baseURL` from the origin the global setup publishes. The runner loads
 * the config before the setup runs, and each worker loads it again after
 */
export const definePlaywrightSuite = (options: PlaywrightSuiteOptions) => {
    const report = path.resolve(ROOT_DIR, ".ignored", "tests", reportName(options.runner))
    return defineConfig({
        testDir: path.resolve(options.dir, "tests"),
        testIgnore: options.testIgnore ?? [],
        fullyParallel: true,
        forbidOnly: env.isCi,
        retries: 0,
        workers: env.isCi ? Math.min(2, Math.floor(os.cpus().length / 2)) : undefined,
        reporter: [
            ...(env.isAgent
                ? [[path.resolve(import.meta.dirname, "failures-reporter.ts")] as const]
                : [
                      ["list"] as const,
                      [
                          "html",
                          {
                              open: "never",
                              outputFolder: path.join(report, "html"),
                          },
                      ] as const,
                  ]),
            ["json", { outputFile: `${report}.json` }] as const,
            ["junit", { outputFile: `${report}.junit.xml` }] as const,
        ],
        outputDir: path.join(report, "results"),
        use: {
            baseURL: process.env[APP_URL_ENV],
            trace: "retain-on-failure",
            locale: "it-IT",
            timezoneId: "Europe/Rome",
            // A worker fetch can bypass `route` and the extra headers. A spec of offline reads sets "allow".
            serviceWorkers: "block",
            contextOptions: {
                reducedMotion: "reduce",
            },
        },
        globalSetup: path.resolve(options.dir, "setup.ts"),
        projects: [
            {
                name: "chromium",
                use: { ...devices["Desktop Chrome"] },
            },
        ],
    })
}
