import { createApi } from "api-client/requests"

import { localStorage } from "@/lib/storage/local-storage"

import { browserTransport } from "./browser-transport"

/**
 * @description Returns the stored base delay in milliseconds plus a random jitter
 */
const computeApiDelayMs = () => {
    const { base, jitter } = localStorage.getItem("api-delay")
    return base + Math.random() * jitter
}

export const api = createApi({
    request: browserTransport,
    getDelayMs: () => (process.env.NODE_ENV === "development" ? computeApiDelayMs() : 0),
})
