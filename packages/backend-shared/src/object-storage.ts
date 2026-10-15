import {
    DeleteObjectCommand,
    GetObjectCommand,
    HeadObjectCommand,
    PutObjectCommand,
    S3Client,
    S3ServiceException,
} from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

/**
 * @remarks Holds a short window, so the browser must use the upload ticket at once
 */
const UPLOAD_URL_EXPIRE_SECONDS = 300
/**
 * @remarks Covers one download, because every URL is minted per request
 */
const DOWNLOAD_URL_EXPIRE_SECONDS = 300

export interface ObjectStorageConfig {
    bucket: string
    region: string
    // Custom endpoint + static credentials for R2 or a local S3 store. Omit both on
    // AWS to fall back to the default credential chain (IAM role) and
    // virtual-hosted-style addressing.
    endpoint?: string
    accessKeyId?: string
    secretAccessKey?: string
}

export interface PresignedUploadResult {
    url: string
    headers: Record<string, string>
}

export interface ObjectHead {
    contentType: string | undefined
    sizeBytes: number
}

export class S3ObjectStorage {
    private readonly client: S3Client
    private readonly bucket: string

    /**
     * @description Builds the S3 client addressing the configured bucket
     * @param config Bucket, region, endpoint and optional static credentials
     * @remarks Uses path-style addressing when an endpoint is set: a local store requires it, and R2 accepts it
     */
    public constructor(config: ObjectStorageConfig) {
        this.bucket = config.bucket
        const hasStaticCredentials =
            config.accessKeyId !== undefined && config.secretAccessKey !== undefined
        this.client = new S3Client({
            region: config.region,
            endpoint: config.endpoint,
            forcePathStyle: config.endpoint !== undefined,
            credentials: hasStaticCredentials
                ? {
                      accessKeyId: config.accessKeyId ?? "",
                      secretAccessKey: config.secretAccessKey ?? "",
                  }
                : undefined,
            // Since SDK v3.729 a presigned request carries a CRC32 of an empty body
            // by default, which breaks a browser upload sending a real payload.
            requestChecksumCalculation: "WHEN_REQUIRED",
            responseChecksumValidation: "WHEN_REQUIRED",
        })
    }

    /**
     * @description Returns a presigned PUT URL and the headers the upload must send
     * @param key Destination object key
     * @param contentType Content type the upload must match exactly
     * @param sizeBytes Exact body length, in bytes
     * @remarks Leaves the signed length check to the store, which can skip it: head the object before trusting its size
     */
    public async createUploadUrl(
        key: string,
        contentType: string,
        sizeBytes: number,
    ): Promise<PresignedUploadResult> {
        const url = await getSignedUrl(
            this.client,
            new PutObjectCommand({
                Bucket: this.bucket,
                Key: key,
                ContentType: contentType,
                ContentLength: sizeBytes,
            }),
            {
                expiresIn: UPLOAD_URL_EXPIRE_SECONDS,
                signableHeaders: new Set(["content-type", "content-length"]),
            },
        )
        return { url, headers: { "Content-Type": contentType } }
    }

    /**
     * @description Returns a short-lived presigned GET URL for the object
     * @param key Object key read
     * @remarks Mints a new URL per call, so no URL is ever stored
     */
    public async createDownloadUrl(key: string): Promise<string> {
        return await getSignedUrl(
            this.client,
            new GetObjectCommand({ Bucket: this.bucket, Key: key }),
            { expiresIn: DOWNLOAD_URL_EXPIRE_SECONDS },
        )
    }

    /**
     * @description Fetches the stored size and content type, or `null` when absent
     * @param key Object key read
     */
    public async headObject(key: string): Promise<ObjectHead | null> {
        try {
            const head = await this.client.send(
                new HeadObjectCommand({ Bucket: this.bucket, Key: key }),
            )
            return {
                contentType: head.ContentType,
                sizeBytes: head.ContentLength ?? 0,
            }
        } catch (error) {
            if (
                error instanceof S3ServiceException &&
                error.$metadata.httpStatusCode === 404
            ) {
                return null
            }
            throw error
        }
    }

    /**
     * @description Deletes the object from the bucket
     * @param key Object key deleted
     */
    public async deleteObject(key: string): Promise<void> {
        await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }))
    }
}
