import type { PresignedUpload } from "models"

/**
 * @description Puts the file to the presigned URL with the headers its signature covers
 * @param presigned Presigned URL and its signed headers
 * @param file File uploaded
 * @throws When the upload response status is not ok
 */
export const uploadToPresignedUrl = async (
    presigned: PresignedUpload,
    file: File,
): Promise<void> => {
    const response = await fetch(presigned.url, {
        method: "PUT",
        headers: presigned.headers,
        body: file,
    })
    if (!response.ok) {
        throw new Error(`Upload failed with status ${response.status}`)
    }
}
