import { z } from "@hono/zod-openapi"

/**
 * @remarks Constrains the client, the presigned POST policy, and the finalize check
 */
export const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024

export const allowedUploadContentTypes = [
    "image/png",
    "image/jpeg",
    "image/webp",
    "image/gif",
    "application/pdf",
] as const
export const uploadContentTypeSchema = z.enum(allowedUploadContentTypes)
export type UploadContentType = z.infer<typeof uploadContentTypeSchema>

/**
 * @remarks Holds the object key only, never a URL, because presigned URLs expire
 */
export const fileMetadataSchema = z.object({
    id: z.uuid(),
    objectKey: z.string(),
    fileName: z.string(),
    contentType: z.string(),
    sizeBytes: z.number().int().nonnegative(),
    createdAt: z.string(),
})
export type FileMetadata = z.infer<typeof fileMetadataSchema>

/**
 * @remarks Declares intent only, because the backend owns the destination key
 */
export const uploadRequestSchema = z.object({
    fileName: z.string().min(1).max(255),
    contentType: uploadContentTypeSchema,
    sizeBytes: z.number().int().positive().max(MAX_UPLOAD_SIZE_BYTES),
})
export type UploadRequest = z.infer<typeof uploadRequestSchema>

/**
 * @remarks Requires a multipart POST of `fields` plus the file to `url`
 */
export const presignedUploadSchema = z.object({
    url: z.string(),
    fields: z.record(z.string(), z.string()),
    key: z.string(),
})
export type PresignedUpload = z.infer<typeof presignedUploadSchema>

/**
 * @remarks Triggers a re-check against storage, because the client is not trusted
 */
export const uploadFinalizeSchema = z.object({
    key: z.string().min(1),
    fileName: z.string().min(1).max(255),
})
export type UploadFinalize = z.infer<typeof uploadFinalizeSchema>

/**
 * @remarks Holds a short-lived presigned URL, minted per request
 */
export const fileDownloadSchema = z.object({
    url: z.string(),
})
export type FileDownload = z.infer<typeof fileDownloadSchema>

export const fileListSchema = z.array(fileMetadataSchema)
export type FileList = z.infer<typeof fileListSchema>
