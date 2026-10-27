import { readFile } from "node:fs/promises"
import path from "node:path"

import { ditherPhoto } from "backend-shared/photos"
import { presignedUploadSchema } from "models"
import type { PhotoUploadRequest } from "models"

import type { BackofficeClient } from "./backoffice-client"

export const EVENT_PHOTO_TICKET_PATH = "/api/backoffice/photos/upload-ticket"

/**
 * @description Dithers a photo file and uploads it through the presigned PUT of an upload ticket route, then returns its key
 * @param client Signed-in backoffice client
 * @param filePath Photo file, JPEG, PNG or WebP
 * @param ticketPath Upload ticket route, such as the event photo or the venue cover one
 * @throws When the ticket route or the upload does not answer `2xx`
 */
export const uploadPhoto = async (
    client: BackofficeClient,
    filePath: string,
    ticketPath: string,
): Promise<string> => {
    const png = await ditherPhoto(await readFile(filePath))
    const ticketRequest: PhotoUploadRequest = {
        fileName: path.basename(filePath),
        contentType: "image/png",
        sizeBytes: png.byteLength,
    }
    const response = await client.request({
        method: "POST",
        path: ticketPath,
        body: JSON.stringify(ticketRequest),
    })
    if (!response.ok) {
        throw new Error(
            `POST ${ticketPath} answered ${String(response.status)}: ${response.text}`,
        )
    }
    const ticket = presignedUploadSchema.parse(JSON.parse(response.text))
    const upload = await fetch(ticket.url, {
        method: "PUT",
        headers: ticket.headers,
        body: png,
    })
    if (!upload.ok) {
        throw new Error(`PUT of ${ticket.key} answered ${String(upload.status)}`)
    }
    return ticket.key
}
