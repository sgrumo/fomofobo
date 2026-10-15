import type {
    FullResult,
    Reporter,
    TestCase,
    TestError,
    TestResult,
} from "@playwright/test/reporter"

/**
 * @description Returns the snippet and the stack of an error as plain text
 * @param error Test error formatted
 */
const formatError = (error: TestError): string => {
    const parts: string[] = []

    if (error.snippet) {
        parts.push(error.snippet)
    }

    if (error.stack) {
        parts.push(error.stack)
    } else if (error.message) {
        parts.push(error.message)
    }

    return (
        parts
            .join("\n\n")
            // Strip ANSI colors and other escape codes
            .replaceAll(/\u001B\[[0-9;]*m/gu, "")
    )
}

class FailuresReporter implements Reporter {
    private passedCount = 0
    private failureCount = 0
    private skippedCount = 0
    private failedTestTitles: string[] = []

    /**
     * @description True when the reporter writes its own output
     */
    public printsToStdio(): boolean {
        return true
    }

    /**
     * @description Counts the result and prints the failure details
     * @param test Test the result belongs to
     * @param result Outcome of the test
     */
    public onTestEnd(test: TestCase, result: TestResult) {
        if (result.status === "passed") {
            this.passedCount += 1
            return
        }

        if (result.status === "skipped") {
            this.skippedCount += 1
            return
        }

        this.failureCount += 1

        const title = test.titlePath().filter(Boolean).join(" > ")
        this.failedTestTitles.push(title)
        process.stderr.write(`\n  ✘ ${title}\n`)

        for (const error of result.errors) {
            process.stderr.write(`\n${formatError(error)}\n`)
        }
    }

    /**
     * @description Counts a global error and prints its details
     * @param error Error raised outside a test
     */
    public onError(error: TestError) {
        this.failureCount += 1
        process.stderr.write(`\n  ✘ Global error\n`)
        process.stderr.write(`\n${formatError(error)}\n`)
    }

    /**
     * @description Prints the totals and the titles of the failed tests
     * @param result Outcome of the whole run
     */
    public onEnd(result: FullResult) {
        process.stderr.write(
            `\n${String(this.passedCount)} passed\n${String(this.failureCount)} failed\n${String(this.skippedCount)} skipped\nstatus: ${result.status}\n\n`,
        )
        if (this.failedTestTitles.length > 0) {
            process.stderr.write(`failed tests:\n${this.failedTestTitles.join("\n")}\n`)
        }
    }
}

export default FailuresReporter
