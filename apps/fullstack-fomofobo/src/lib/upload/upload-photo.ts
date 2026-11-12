import { noop } from "es-toolkit"
import { ditheredPhotoContentTypeSchema, photoContentTypeSchema } from "models"
import type { PhotoUploadRequest, PhotoUploadTicket } from "models"

import { ditherPhoto } from "./dither-photo"
import { uploadToPresignedUrl } from "./upload-to-presigned-url"

/**
 * @description Dithers a photo, asks for an upload ticket, and uploads the dithered copy and the original beside it, then returns the key and the dithered copy
 * @param file Photo picked, a type that `validatePhotoFile` allows
 * @param createTicket Asks the API for the ticket of the photo
 * @param onProgress Receives the share of the dithered copy sent
 */
export const uploadPhoto = async (
    file: File,
    createTicket: (request: PhotoUploadRequest) => Promise<PhotoUploadTicket>,
    onProgress: (share: number) => void,
): Promise<{ key: string; dithered: Blob }> => {
    const dithered = await ditherPhoto(file)
    const originalType = photoContentTypeSchema.safeParse(file.type)
    const ticket = await createTicket({
        fileName: file.name,
        contentType: ditheredPhotoContentTypeSchema.enum["image/png"],
        sizeBytes: dithered.size,
        original: originalType.success
            ? { contentType: originalType.data, sizeBytes: file.size }
            : undefined,
    })
    await Promise.all([
        uploadToPresignedUrl(ticket, dithered, onProgress),
        ticket.original === undefined
            ? undefined
            : uploadToPresignedUrl(ticket.original, file, noop),
    ])
    return { key: ticket.key, dithered }
}
