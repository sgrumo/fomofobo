import type { PresignedUpload } from "models"

/**
 * @description Puts the file to the presigned URL with the headers its signature covers, and reports the share sent
 * @param presigned Presigned URL and its signed headers
 * @param file File uploaded
 * @param onProgress Receives the share of the file sent, from 0 to 1
 * @throws When the upload fails or answers outside the `2xx` range
 */
export const uploadToPresignedUrl = (
    presigned: PresignedUpload,
    file: File,
    onProgress: (share: number) => void,
): Promise<void> =>
    new Promise((resolve, reject) => {
        const request = new XMLHttpRequest()
        request.open("PUT", presigned.url)
        for (const [name, value] of Object.entries(presigned.headers)) {
            request.setRequestHeader(name, value)
        }
        request.upload.addEventListener("progress", event => {
            if (event.lengthComputable) {
                onProgress(event.loaded / event.total)
            }
        })
        request.addEventListener("load", () => {
            if (request.status >= 200 && request.status < 300) {
                resolve()
                return
            }
            reject(new Error(`Upload failed with status ${String(request.status)}`))
        })
        request.addEventListener("error", () => {
            reject(new Error("Upload failed"))
        })
        request.send(file)
    })
