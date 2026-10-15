import type { PresignedUpload } from "models"

/**
 * @description Posts the file to the presigned URL with its required form fields
 * @param presigned Presigned URL and its form fields
 * @param file File uploaded
 * @throws When the upload response status is not ok
 */
export const uploadToPresignedPost = async (
    presigned: PresignedUpload,
    file: File,
): Promise<void> => {
    const form = new FormData()
    for (const [key, value] of Object.entries(presigned.fields)) {
        form.append(key, value)
    }
    form.append("file", file)

    const response = await fetch(presigned.url, { method: "POST", body: form })
    if (!response.ok) {
        throw new Error(`Upload failed with status ${response.status}`)
    }
}
