import { z } from "@hono/zod-openapi"

/**
 * @remarks Constrains the client and the presigned POST policy
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
