import "server-only"
import { createApi } from "api-client/requests"

import { serverTransport } from "./transport"

const apiDelay = { base: 250, jitter: 50 }

/**
 * @description Returns the fixed base delay in milliseconds plus a random jitter
 */
const computeApiDelayMs = () => apiDelay.base + Math.random() * apiDelay.jitter

/**
 * @description Endpoints bound to the in-process transport
 * @remarks Serves the prefetch of a Server Component. It shares every cache key with the
 * browser endpoints, so the hydrated data matches
 * @remarks Delays every development call by a fixed amount, so a prefetch shows the same
 * latency as a browser call.
 */
export const serverApi = createApi({
    request: serverTransport,
    getDelayMs: () => (process.env.NODE_ENV === "development" ? computeApiDelayMs() : 0),
})
