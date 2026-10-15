import { createLog, reportName } from "e2e-kit/env"
import { defineLifecycle } from "e2e-kit/lifecycle"

import { appServer, buildApp, prepareDatabase } from "./server"

/**
 * @description Builds the global setup of a suite: object store, OpenID provider, Worker build, local D1, and the local Worker
 * @param runner Runner of the suite, appended to the log prefix
 * @remarks Starts the server here, after the container env is set, and never through the
 * Playwright `webServer` key: the Worker takes its variables at start
 */
export const defineAppLifecycle = (runner: string) =>
    defineLifecycle({ log: createLog(reportName(runner)) }, async stack => {
        const port = String(await stack.freePort())
        const inspectorPort = String(await stack.freePort())
        const url = `http://localhost:${port}`
        await stack.startObjectStore({ corsOrigins: [url] })
        await stack.startOidcProvider({ appOrigin: url })
        buildApp()
        const persistDir = prepareDatabase(runner)
        await stack.startServer(
            appServer({ app: port, inspector: inspectorPort }, persistDir),
        )
        stack.publishAppUrl(url)
    })
