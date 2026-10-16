import type { ChildProcess } from "node:child_process"

import { withTimeout } from "es-toolkit"
import { provisionObjectStore } from "objectstore-init"

import type { StartedTestContainer } from "./containers"
import {
    OBJECT_STORE_PORT,
    objectStoreEnv,
    startObjectStoreContainer,
} from "./containers"
import type { Log } from "./env"
import { APP_URL_ENV } from "./env"
import type { ServerSpec } from "./server"
import { freePort, spawnServer, stopProcessGroup, waitForServer } from "./server"

const DEFAULT_TIMEOUT_MS = 240_000

export interface LifecycleOptions {
    log: Log
    /** Deadline of the whole start, containers and servers included. */
    timeoutMs?: number
}

export interface Stack {
    /** Returns a TCP port that no process listens on, for a server of the suite. */
    freePort: () => Promise<number>
    /**
     * Starts the object store and creates the bucket, for the upload flows. The bucket
     * admits the browser origins in `corsOrigins`.
     */
    startObjectStore: (options: { corsOrigins: [string, ...string[]] }) => Promise<void>
    /** Spawns a server, waits until it answers, and stops it with the stack. */
    startServer: (spec: ServerSpec) => Promise<void>
    /** Publishes the origin of the app under test to the runner and the test workers. */
    publishAppUrl: (url: string) => void
}

/**
 * @description Builds the global setup of a suite: what `start` asks the stack for
 * @param options Logger and deadline
 * @param start Starts the containers and servers of the suite
 * @remarks Writes the object store variables into `process.env`, so every server and
 * test worker started later inherits them
 */
export const defineLifecycle =
    (options: LifecycleOptions, start: (stack: Stack) => Promise<void>) =>
    async (): Promise<() => Promise<void>> => {
        const { log } = options
        const containers: StartedTestContainer[] = []
        const servers: ChildProcess[] = []

        const teardown = async () => {
            log("stopping servers...")
            await Promise.all(servers.map(stopProcessGroup))
            log("stopping containers...")
            await Promise.all(
                containers.map(container =>
                    container.stop().catch(() => {
                        // Best-effort cleanup
                    }),
                ),
            )
        }

        const stack: Stack = {
            freePort,
            startObjectStore: async ({ corsOrigins }) => {
                const objectStore = await startObjectStoreContainer(log)
                containers.push(objectStore)
                const endpoint = `http://${objectStore.getHost()}:${String(
                    objectStore.getMappedPort(OBJECT_STORE_PORT),
                )}`
                const s3Env = objectStoreEnv(endpoint)

                log("provisioning the object store...")
                await provisionObjectStore({
                    bucket: s3Env.S3_BUCKET,
                    region: s3Env.S3_REGION,
                    endpoint,
                    accessKeyId: s3Env.S3_ACCESS_KEY,
                    secretAccessKey: s3Env.S3_SECRET_KEY,
                    corsAllowOrigins: corsOrigins,
                })
                Object.assign(process.env, s3Env)
            },
            startServer: async spec => {
                const proc = spawnServer(spec, log)
                servers.push(proc)
                await waitForServer(proc, spec, log)
            },
            publishAppUrl: url => {
                process.env[APP_URL_ENV] = url
            },
        }

        const controller = new AbortController()
        try {
            await withTimeout(
                () => start(stack),
                options.timeoutMs ?? DEFAULT_TIMEOUT_MS,
                { signal: controller.signal },
            )
        } catch (error) {
            await teardown()
            throw error
        } finally {
            // Clears the armed timer, which holds the event loop open until it fires
            controller.abort()
        }

        return teardown
    }
