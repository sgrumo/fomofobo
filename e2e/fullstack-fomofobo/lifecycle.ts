import { createLog, reportName } from "e2e-kit/env"
import { defineLifecycle } from "e2e-kit/lifecycle"

import { appServer, buildApp, prepareDatabase } from "./server"

/**
 * @description Builds the global setup of a suite: object store, production bundle, database file, and the app server
 * @param runner Runner of the suite, appended to the log prefix
 * @remarks Starts the server here, after the container env is set, and never through the
 * Playwright `webServer` key: the server takes its variables at start
 */
export const defineAppLifecycle = (runner: string) =>
    defineLifecycle({ log: createLog(reportName(runner)) }, async stack => {
        const port = String(await stack.freePort())
        const url = `http://localhost:${port}`
        await stack.startObjectStore({ corsOrigins: [url] })
        buildApp()
        const databaseUrl = prepareDatabase(runner)
        await stack.startServer(appServer(port, url, databaseUrl))
        stack.publishAppUrl(url)
    })
