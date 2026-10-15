import type { ChildProcess } from "node:child_process"
import { spawn } from "node:child_process"
import { once } from "node:events"
import { createServer } from "node:net"
import { setTimeout } from "node:timers/promises"

import { identity } from "es-toolkit"

/** Wait for a server to exit after `SIGTERM`, before the `SIGKILL` fallback. */
export const GRACEFUL_STOP_MS = 5000

/**
 * @description Sends a signal to the process group of a detached child
 * @param pid Leader of the process group
 * @param signal Signal sent
 */
const signalGroup = (pid: number, signal: NodeJS.Signals) => {
    try {
        process.kill(-pid, signal)
    } catch {
        // The group can have exited already.
    }
}

/**
 * @description Stops the process group of a detached child with `SIGTERM`, then `SIGKILL` after the grace period
 * @param proc Detached child process
 * @remarks Sends `SIGTERM` first because pnpm relays it to the script's own process group, while a `SIGKILL` leaves the script alive
 */
export const stopProcessGroup = async (proc: ChildProcess) => {
    const { pid } = proc
    if (pid === undefined || proc.exitCode !== null || proc.signalCode !== null) {
        return
    }

    const controller = new AbortController()
    // The abort below rejects the losing promise, so both settle to `false` on rejection.
    const exited = once(proc, "exit", { signal: controller.signal }).then(
        () => true,
        () => false,
    )
    const timedOut = setTimeout(GRACEFUL_STOP_MS, false, {
        signal: controller.signal,
    }).catch(() => false)

    signalGroup(pid, "SIGTERM")
    const stopped = await Promise.race([exited, timedOut])
    // Clears the losing timer or listener, which holds the event loop open
    controller.abort()
    if (!stopped) {
        signalGroup(pid, "SIGKILL")
    }
}

/** Wait for one readiness probe, so an address that never answers cannot stall the poll. */
const PROBE_TIMEOUT_MS = 1000

// Both loopback addresses: a server that binds `localhost` takes one of them, and which
// one depends on the resolver of the machine.
const LOOPBACK_HOSTS = ["127.0.0.1", "[::1]"]

/**
 * @description Returns a TCP port that no process listens on
 * @remarks Frees the port before it returns, so another process can take it before the server binds it
 */
export const freePort = async (): Promise<number> => {
    const server = createServer()
    // No host: the probe binds every address, IPv4 and IPv6.
    server.listen(0)
    await once(server, "listening")
    const address = server.address()
    server.close()
    await once(server, "close")
    if (address === null || typeof address === "string") {
        throw new Error("The port probe returned no TCP address")
    }
    return address.port
}

/**
 * @description Returns the URLs a readiness probe tries: both loopback addresses for `localhost`, else the URL alone
 * @param url Endpoint polled
 */
const probeUrls = (url: string): string[] =>
    new URL(url).hostname === "localhost"
        ? LOOPBACK_HOSTS.map(host => {
              const probe = new URL(url)
              probe.hostname = host
              return probe.href
          })
        : [url]

/**
 * @description True when the endpoint answers with a 2xx response before the probe timeout
 * @param url Endpoint probed
 */
const answers = async (url: string): Promise<boolean> => {
    try {
        const res = await fetch(url, { signal: AbortSignal.timeout(PROBE_TIMEOUT_MS) })
        return res.ok
    } catch {
        return false
    }
}

/**
 * @description Polls an HTTP endpoint until it answers with a 2xx response
 * @param url Endpoint polled
 * @param label Name used in the log and error messages
 * @param log Sink for progress messages
 * @param maxRetries Attempt count, one second apart
 * @throws When the endpoint stays unready after every attempt
 * @remarks Probes `127.0.0.1` and `::1` for a `localhost` URL, like the port check of Playwright
 */
export const waitForHttp = async (
    url: string,
    label: string,
    log: (msg: string) => void,
    maxRetries = 30,
) => {
    const urls = probeUrls(url)
    for (let i = 0; i < maxRetries; i += 1) {
        const results = await Promise.all(urls.map(answers))
        if (results.some(identity)) {
            log(i > 0 ? `${label} ready after ${String(i)} retries` : `${label} ready`)
            return
        }
        if (i < maxRetries - 1) {
            await setTimeout(1000)
        }
    }
    throw new Error(`${label} not ready after ${String(maxRetries)} retries`)
}

export interface ServerSpec {
    /** Name used in the log and error messages. */
    label: string
    command: string
    args: string[]
    cwd: string
    /** Variables added to the environment the containers produced. */
    env: Record<string, string>
    /** URL polled until the server answers. */
    healthUrl: string
}

/**
 * @description Spawns a server in a process group of its own and logs a non-zero exit
 * @param spec Server started
 * @param log Sink for progress messages
 * @remarks Returns before the server answers: the caller waits on `spec.healthUrl`
 */
export const spawnServer = (
    spec: ServerSpec,
    log: (msg: string) => void,
): ChildProcess => {
    log(`starting ${spec.label}...`)
    const proc = spawn(spec.command, spec.args, {
        cwd: spec.cwd,
        env: { ...process.env, ...spec.env },
        stdio: ["ignore", "ignore", "inherit"],
        // A group of its own, so the stop reaches every process the command starts
        detached: true,
    })
    proc.unref()
    proc.on("exit", code => {
        if (code !== null && code !== 0) {
            log(`${spec.label} exited with code ${String(code)}`)
        }
    })
    return proc
}

/**
 * @description Waits until the server answers on its health URL
 * @param proc Process of the server
 * @param spec Server waited on
 * @param log Sink for progress messages
 * @throws When the process exits first, or the URL stays unready
 * @remarks Fails on an early exit, so a server that already holds the port never
 * passes for the one that could not bind it
 */
export const waitForServer = async (
    proc: ChildProcess,
    spec: ServerSpec,
    log: (msg: string) => void,
) => {
    const controller = new AbortController()
    // The abort below settles the listener once the server answers.
    const exitedEarly = once(proc, "exit", { signal: controller.signal }).then(
        ([code]) => {
            throw new Error(
                `${spec.label} exited with code ${String(code)} before it answered on ${spec.healthUrl}`,
            )
        },
        () => undefined,
    )
    try {
        await Promise.race([waitForHttp(spec.healthUrl, spec.label, log), exitedEarly])
    } finally {
        controller.abort()
    }
}
