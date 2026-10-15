import { createApi } from "api-client/requests"

import { localStorage } from "@/lib/storage/local-storage"

import { browserTransport } from "./browser-transport"
import { createUploadFileMutation } from "./upload-file-mutation"

/**
 * @description Returns the stored base delay in milliseconds plus a random jitter
 */
const computeApiDelayMs = () => {
    const { base, jitter } = localStorage.getItem("api-delay")
    return base + Math.random() * jitter
}

const requests = createApi({
    request: browserTransport,
    getDelayMs: () => (process.env.NODE_ENV === "development" ? computeApiDelayMs() : 0),
})

export const api = {
    ...requests,
    uploadFileMutation: createUploadFileMutation(requests),
}
