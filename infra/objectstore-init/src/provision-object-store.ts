import {
    BucketAlreadyExists,
    BucketAlreadyOwnedByYou,
    CreateBucketCommand,
    PutBucketCorsCommand,
    PutBucketPolicyCommand,
    S3Client,
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
 * @description Creates the photos bucket, opens it to anonymous reads, and writes its CORS rule
 * @param config Bucket, endpoint, credentials and the allowed browser origins
 * @throws When the store rejects a call, so a deployment stops on a broken store
 * @remarks Needs credentials that can create a bucket, so only the local and E2E stores
 * run it, and `infra/vercel/README.md` describes the same state on R2
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

    // Mirrors the public R2 bucket: anyone reads a photo by its URL, nobody lists the keys
    await client.send(
        new PutBucketPolicyCommand({
            Bucket: config.bucket,
            Policy: JSON.stringify({
                Version: "2012-10-17",
                Statement: [
                    {
                        Effect: "Allow",
                        Principal: { AWS: ["*"] },
                        Action: ["s3:GetObject"],
                        Resource: [`arn:aws:s3:::${config.bucket}/*`],
                    },
                ],
            }),
        }),
    )

    await client.send(
        new PutBucketCorsCommand({
            Bucket: config.bucket,
            CORSConfiguration: {
                CORSRules: [
                    {
                        AllowedOrigins: [...config.corsAllowOrigins],
                        AllowedMethods: ["GET", "PUT", "HEAD"],
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
