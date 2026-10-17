import "server-only"
import type { S3ObjectStorage } from "backend-shared"
import type { PhotoUploadRequest, PresignedUpload } from "models"

/**
 * @description Returns the prefix of every photo key that an account uploads
 * @param accountId Account that uploads
 */
export const photoKeyPrefix = (accountId: string): string => `events/${accountId}/`

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
        const key = `${photoKeyPrefix(accountId)}${crypto.randomUUID()}`
        const upload = await this.photoStorage.createUploadUrl(
            key,
            request.contentType,
            request.sizeBytes,
        )
        return { ...upload, key }
    }
}
