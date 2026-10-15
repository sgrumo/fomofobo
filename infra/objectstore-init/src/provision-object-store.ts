import {
    BucketAlreadyExists,
    BucketAlreadyOwnedByYou,
    CreateBucketCommand,
    DeleteBucketPolicyCommand,
    PutBucketCorsCommand,
    S3Client,
    S3ServiceException,
} from "@aws-sdk/client-s3"

/**
 * @remarks Caches the preflight answer, so the browser skips it on a repeat upload
 */
const CORS_MAX_AGE_SECONDS = 3000

export interface ObjectStoreProvisionConfig {
    bucket: string
    region: string
    endpoint: string
    accessKeyId: string
    secretAccessKey: string
    /** Browser origins allowed to call the store. One entry per page that uploads. */
    corsAllowOrigins: readonly string[]
}

/**
 * @description Creates the bucket, keeps it private, and writes its CORS rule
 * @param config Bucket, endpoint, credentials and the allowed browser origins
 * @throws When the store rejects a call, so a deployment stops on a broken store
 * @remarks Needs credentials that can create a bucket, so only a self-hosted store
 * runs it, and the CDK stack declares the same state on AWS
 */
export const provisionObjectStore = async (
    config: ObjectStoreProvisionConfig,
): Promise<void> => {
    const client = new S3Client({
        region: config.region,
        endpoint: config.endpoint,
        forcePathStyle: true,
        credentials: {
            accessKeyId: config.accessKeyId,
            secretAccessKey: config.secretAccessKey,
        },
    })

    try {
        await client.send(new CreateBucketCommand({ Bucket: config.bucket }))
    } catch (error) {
        if (
            !(error instanceof BucketAlreadyOwnedByYou) &&
            !(error instanceof BucketAlreadyExists)
        ) {
            throw error
        }
    }

    // Reasserts the private state that a new bucket starts in, because an
    // operator can have opened an existing bucket by hand.
    try {
        await client.send(new DeleteBucketPolicyCommand({ Bucket: config.bucket }))
    } catch (error) {
        if (
            !(error instanceof S3ServiceException) ||
            error.name !== "NoSuchBucketPolicy"
        ) {
            throw error
        }
    }

    await client.send(
        new PutBucketCorsCommand({
            Bucket: config.bucket,
            CORSConfiguration: {
                CORSRules: [
                    {
                        AllowedOrigins: [...config.corsAllowOrigins],
                        AllowedMethods: ["GET", "POST", "HEAD"],
                        AllowedHeaders: ["*"],
                        ExposeHeaders: ["ETag"],
                        MaxAgeSeconds: CORS_MAX_AGE_SECONDS,
                    },
                ],
            },
        }),
    )

    client.destroy()
}
