import { FilesRoutes } from "api-routes"
import type { PresignedUpload } from "models"

import { createApiCall } from "../api"

export const requestUpload = createApiCall(FilesRoutes.requestUpload)
export const finalizeFile = createApiCall(FilesRoutes.finalize)

/**
 * @description Requests an upload with a body the typed schema forbids
 * @param body Raw request body, unchecked at compile time
 * @remarks Serves negative tests only, since the route validates at runtime
 */
export const requestUploadRaw = (body: Record<string, unknown>) =>
    requestUpload({ body } as Parameters<typeof requestUpload>[0])
export const getFiles = createApiCall(FilesRoutes.getList)
export const downloadFile = createApiCall(FilesRoutes.download)
export const deleteFile = createApiCall(FilesRoutes.delete)

/**
 * @description Uploads the bytes as multipart form-data to the presigned POST URL
 * @param presigned Presigned POST policy, URL and form fields
 * @param bytes File content uploaded
 * @param contentType MIME type of the content
 * @param fileName Name carried by the form part
 * @remarks Returns the raw HTTP status, `204` from the object store on success
 */
export const uploadToPresignedPost = async (
    presigned: PresignedUpload,
    bytes: Uint8Array,
    contentType: string,
    fileName: string,
): Promise<number> => {
    const form = new FormData()
    for (const [key, value] of Object.entries(presigned.fields)) {
        form.append(key, value)
    }
    form.append("file", new Blob([bytes], { type: contentType }), fileName)
    const res = await fetch(presigned.url, { method: "POST", body: form })
    return res.status
}
