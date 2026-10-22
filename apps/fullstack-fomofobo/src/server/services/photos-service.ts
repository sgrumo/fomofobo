import "server-only"
import type { S3ObjectStorage } from "backend-shared"
import { ditheredPhotoContentTypeSchema, MAX_UPLOAD_SIZE_BYTES } from "models"
import type { PhotoUploadRequest, PresignedUpload } from "models"

import { appError } from "../errors"

/**
 * @description Returns the prefix of every photo key that an account uploads
 * @param accountId Account that uploads
 */
export const photoKeyPrefix = (accountId: string): string => `events/${accountId}/`

/**
 * @description Returns the prefix of every cover key of a venue
 * @param venueId Venue whose cover is uploaded
 */
export const venueCoverKeyPrefix = (venueId: string): string => `venues/${venueId}/`

/**
 * @description Throws unless the key sits under the prefix and holds a dithered photo within the size limit
 * @param photoStorage Bucket of the photos
 * @param key Photo key of the write
 * @param prefix Prefix of the uploads the writer may reference
 * @throws When the key is outside the prefix, missing, not a PNG, or too large
 */
export const assertUploadedPhoto = async (
    photoStorage: S3ObjectStorage,
    key: string,
    prefix: string,
): Promise<void> => {
    if (!key.startsWith(prefix)) {
        throw appError(
            "InvalidPhotoUpload",
            `Photo ${key} is not an upload of the writer`,
        )
    }
    const head = await photoStorage.headObject(key)
    if (
        head === null ||
        !ditheredPhotoContentTypeSchema.safeParse(head.contentType).success ||
        head.sizeBytes > MAX_UPLOAD_SIZE_BYTES
    ) {
        throw appError(
            "InvalidPhotoUpload",
            `Photo ${key} is missing or not an allowed image`,
        )
    }
}

/**
 * @description Returns the public URL of a photo in the public bucket
 * @param baseUrl Public base URL of the bucket, with no trailing slash
 * @param objectKey Key of the photo
 */
export const photoUrl = (baseUrl: string, objectKey: string): string =>
    `${baseUrl}/${objectKey}`

export class PhotosService {
    private readonly photoStorage: S3ObjectStorage
    public constructor(photoStorage: S3ObjectStorage) {
        this.photoStorage = photoStorage
    }

    /**
     * @description Builds a presigned PUT of one photo under a new key of the account
     * @param request Content type and size of the photo
     * @param accountId Account that uploads
     */
    public async createUploadTicket(
        request: PhotoUploadRequest,
        accountId: string,
    ): Promise<PresignedUpload> {
        return await this.createTicketUnder(photoKeyPrefix(accountId), request)
    }

    /**
     * @description Builds a presigned PUT of one photo under a new key of the prefix
     * @param prefix Prefix of the new key
     * @param request Content type and size of the photo
     */
    public async createTicketUnder(
        prefix: string,
        request: PhotoUploadRequest,
    ): Promise<PresignedUpload> {
        const key = `${prefix}${crypto.randomUUID()}`
        const upload = await this.photoStorage.createUploadUrl(
            key,
            request.contentType,
            request.sizeBytes,
        )
        return { ...upload, key }
    }
}
