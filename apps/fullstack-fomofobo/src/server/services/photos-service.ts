import "server-only"
import type { S3ObjectStorage } from "backend-shared"
import { logger } from "backend-shared"
import {
    ditheredPhotoContentTypeSchema,
    MAX_UPLOAD_SIZE_BYTES,
    photoContentTypeSchema,
} from "models"
import type { PhotoUploadRequest, PhotoUploadTicket } from "models"

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
 * @description Returns the prefix of every image key of a category
 * @param categoryId Category whose image is uploaded
 */
export const categoryImageKeyPrefix = (categoryId: string): string =>
    `categories/${categoryId}/`

/**
 * @description Returns the key of the original upload of a dithered photo
 * @param key Key of the dithered photo
 */
const originalKeyOf = (key: string): string => `${key}-original`

/**
 * @description Fetches the key of the original of a dithered photo, or `null` when none was uploaded
 * @param photoStorage Bucket of the photos
 * @param key Key of the dithered photo
 * @throws When the original is not an allowed photo or is too large
 */
export const uploadedOriginalKeyOf = async (
    photoStorage: S3ObjectStorage,
    key: string,
): Promise<string | null> => {
    const originalKey = originalKeyOf(key)
    const head = await photoStorage.headObject(originalKey)
    if (head === null) {
        return null
    }
    if (
        !photoContentTypeSchema.safeParse(head.contentType).success ||
        head.sizeBytes > MAX_UPLOAD_SIZE_BYTES
    ) {
        throw appError(
            "InvalidPhotoUpload",
            `Original ${originalKey} is not an allowed image`,
        )
    }
    return originalKey
}

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
 * @description Deletes a replaced or orphaned object from the bucket, and logs a failure
 * @param photoStorage Bucket of the photos
 * @param key Object key deleted
 * @param label Name of the object in the log message, such as "Venue cover"
 * @remarks Belongs after the database write: a failure then leaves an unused object
 */
export const deleteReplacedObject = async (
    photoStorage: S3ObjectStorage,
    key: string,
    label: string,
): Promise<void> => {
    try {
        await photoStorage.deleteObject(key)
    } catch (error) {
        logger.error(`${label} not deleted`, {
            key,
            error: error instanceof Error ? error.message : String(error),
        })
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
     * @description Builds a presigned PUT of one photo under a new key of the account, and of its original when asked
     * @param request Content type and size of the photo and of its original
     * @param accountId Account that uploads
     */
    public async createUploadTicket(
        request: PhotoUploadRequest,
        accountId: string,
    ): Promise<PhotoUploadTicket> {
        return await this.createTicketUnder(photoKeyPrefix(accountId), request)
    }

    /**
     * @description Builds a presigned PUT of one photo under a new key of the prefix, and of its original when asked
     * @param prefix Prefix of the new key
     * @param request Content type and size of the photo and of its original
     */
    public async createTicketUnder(
        prefix: string,
        request: PhotoUploadRequest,
    ): Promise<PhotoUploadTicket> {
        const key = `${prefix}${crypto.randomUUID()}`
        const [upload, original] = await Promise.all([
            this.photoStorage.createUploadUrl(
                key,
                request.contentType,
                request.sizeBytes,
            ),
            request.original === undefined
                ? undefined
                : this.photoStorage.createUploadUrl(
                      originalKeyOf(key),
                      request.original.contentType,
                      request.original.sizeBytes,
                  ),
        ])
        return { ...upload, key, original }
    }
}
