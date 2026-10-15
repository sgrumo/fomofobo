import { isAgent } from "../../../configs/agent/is-agent"

export { reportName } from "../../../configs/report-name"

export const env = {
    isCi: !!process.env.CI,
    isAgent,
}

/**
 * @description Builds a logger that prefixes each message, silent when an agent runs the suite
 * @param prefix Label printed before each message
 */
export const createLog =
    (prefix: string) =>
    (message: string): void => {
        if (env.isAgent) {
            return
        }
        console.log(`[${prefix}] ${message}`)
    }

export type Log = ReturnType<typeof createLog>

/** Variable the lifecycle hands the origin of the app under test to the runner and the test workers through. */
export const APP_URL_ENV = "E2E_APP_URL"

/**
 * @description Returns the value that the lifecycle published under the variable
 * @param variable Variable read
 * @throws When no lifecycle published one
 */
const published = (variable: string): string => {
    const value = process.env[variable]
    if (value === undefined || value === "") {
        throw new Error(`No ${variable} in the environment: no lifecycle ran`)
    }
    return value
}

/**
 * @description Returns the origin of the app under test that the lifecycle published
 * @throws When no lifecycle published one
 */
export const publishedAppUrl = (): string => published(APP_URL_ENV)
