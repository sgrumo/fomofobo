import { createLog, reportName } from "e2e-kit/env"
import { defineLifecycle } from "e2e-kit/lifecycle"

import { appServer, buildApp, geocodingMockServer, prepareDatabase } from "./server"

/**
 * @description Builds the global setup of a suite: object store, geocoding mock, production bundle, database file, and the app server
 * @param runner Runner of the suite, appended to the log prefix
 * @remarks Starts the server here, after the container env is set, and never through the
 * Playwright `webServer` key: the server takes its variables at start
 */
export const defineAppLifecycle = (runner: string) =>
    defineLifecycle({ log: createLog(reportName(runner)) }, async stack => {
        const port = String(await stack.freePort())
        const url = `http://localhost:${port}`
        const objectStore = await stack.startObjectStore({ corsOrigins: [url] })
        const geocodingPort = String(await stack.freePort())
        await stack.startServer(geocodingMockServer(geocodingPort))
        buildApp()
        const databaseUrl = prepareDatabase(runner)
        await stack.startServer(
            appServer({
                port,
                origin: url,
                databaseUrl,
                photosPublicBaseUrl: `${objectStore.endpoint}/${objectStore.bucket}`,
                geocodingBaseUrl: `http://127.0.0.1:${geocodingPort}`,
            }),
        )
        stack.publishAppUrl(url)
    })
