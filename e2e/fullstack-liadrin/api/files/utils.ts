import { faker } from "@faker-js/faker"
import { expectRawStatus, expectStatus } from "e2e-kit/assertions"
import type { FileMetadata, UploadContentType, UploadRequest } from "models"
import { allowedUploadContentTypes } from "models"

import { finalizeFile, requestUpload, uploadToPresignedPost } from "./api"

/**
 * @remarks Holds a real 1x1 PNG, since the backend re-verifies the size against storage
 */
const PNG_BYTES = Uint8Array.from(
    atob(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    ),
    char => char.codePointAt(0) ?? 0,
)

/**
 * @description Returns a fresh copy of the 1x1 PNG bytes
 */
export const mockPngBytes = (): Uint8Array => PNG_BYTES.slice()

/**
 * @description Returns a random allowed upload content type
 */
export const mockContentType = (): UploadContentType =>
    faker.helpers.arrayElement(allowedUploadContentTypes)

/**
 * @description Builds a random file name carrying the extension
 * @param extension File extension, without the dot
 */
export const mockFileName = (extension = "png"): string =>
    `${faker.system.commonFileName(extension).replace(/\.[^.]+$/u, "")}.${extension}`

/**
 * @description Builds an upload request for the 1x1 PNG
 * @param overrides Fields replacing the defaults
 */
export const mockUploadRequest = (overrides?: Partial<UploadRequest>): UploadRequest => ({
    fileName: mockFileName(),
    contentType: "image/png",
    sizeBytes: PNG_BYTES.length,
    ...overrides,
})

/**
 * @description Requests a ticket, uploads the bytes, and finalizes the file
 * @param overrides Upload request fields replacing the defaults
 * @remarks Asserts every step, so a setup failure fails the calling test
 */
export const createFinalizedFile = async (
    overrides?: Partial<UploadRequest>,
): Promise<FileMetadata> => {
    const bytes = mockPngBytes()
    const request = mockUploadRequest({
        contentType: "image/png",
        sizeBytes: bytes.length,
        ...overrides,
    })

    const ticketRes = await requestUpload({ body: request })
    expectStatus(ticketRes, 200)

    const uploadStatus = await uploadToPresignedPost(
        ticketRes.data,
        bytes,
        request.contentType,
        request.fileName,
    )
    expectRawStatus({ status: uploadStatus }, 204)

    const finalizeRes = await finalizeFile({
        body: { key: ticketRes.data.key, fileName: request.fileName },
    })
    expectStatus(finalizeRes, 201)

    return finalizeRes.data
}
