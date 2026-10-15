import path from "node:path"

import { isAgent } from "../agent/is-agent.ts"
import { reportName } from "../report-name.ts"

const isCi = !!process.env.CI

const testsDir = path.resolve(import.meta.dirname, "../../.ignored/tests")

/**
 * @description Builds the terminal reporters of the mode, with the report name as the title of the CI job summary
 * @param report Report name
 */
const consoleReporters = (report: string) => {
    const githubActions: ["github-actions", { jobSummary: { title: string } }] = [
        "github-actions",
        { jobSummary: { title: report } },
    ]
    return isCi ? ["default", githubActions] : isAgent ? ["agent"] : ["default"]
}

/**
 * @description Builds the reporters and the report files of one test run
 * @param report Report name: `.ignored/tests/<report>.json` and `<report>.junit.xml`
 */
export const outputOptionsFor = (report: string) => ({
    reporters: [...consoleReporters(report), "json", "junit"],
    outputFile: {
        json: path.join(testsDir, `${report}.json`),
        junit: path.join(testsDir, `${report}.junit.xml`),
    },
})

export const outputOptions = outputOptionsFor(`unit-${reportName()}`)
