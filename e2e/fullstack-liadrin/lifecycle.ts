import { createLog, reportName } from "e2e-kit/env"
import { defineLifecycle } from "e2e-kit/lifecycle"

import { appServer, buildApp } from "./server"

/**
 * @description Builds the global setup of a suite: object store, OpenID provider, app build, and the standalone server
 * @param runner Runner of the suite, appended to the log prefix
 * @remarks Starts the server here, after the container env is set, and never through the
 * Playwright `webServer` key: the app reads the database on its first request
 */
export const defineAppLifecycle = (runner: string) =>
    defineLifecycle({ log: createLog(reportName(runner)) }, async stack => {
        const port = String(await stack.freePort())
        const url = `http://localhost:${port}`
        await stack.startObjectStore({ corsOrigins: [url] })
        await stack.startOidcProvider({ appOrigin: url })
        buildApp()
        await stack.startServer(appServer(port))
        stack.publishAppUrl(url)
    })
