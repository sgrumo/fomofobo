import { mutationOptions } from "@tanstack/react-query"
import { cacheKeys } from "api-client/cache-keys"
import type { Api } from "api-client/requests"
import { uploadContentTypeSchema } from "models"

import { uploadToPresignedPost } from "@/lib/upload/upload-to-presigned-post"

/**
 * @description Builds the mutation options uploading a file and finalizing its metadata
 * @param requestFileUpload Endpoint yielding the presigned upload
 * @param finalizeFileUpload Endpoint persisting the uploaded file metadata
 */
export const createUploadFileMutation = ({
    requestFileUpload,
    finalizeFileUpload,
}: Api) =>
    mutationOptions({
        mutationFn: async (file: File) => {
            const contentType = uploadContentTypeSchema.safeParse(file.type)
            if (!contentType.success) {
                throw new Error(`Unsupported file type: ${file.type}`)
            }
            const presigned = await requestFileUpload({
                params: {},
                body: {
                    fileName: file.name,
                    contentType: contentType.data,
                    sizeBytes: file.size,
                },
            })
            await uploadToPresignedPost(presigned, file)
            return finalizeFileUpload({
                params: {},
                body: { key: presigned.key, fileName: file.name },
            })
        },
        onSuccess: (_1, _2, _3, ctx) =>
            ctx.client.invalidateQueries({ queryKey: cacheKeys.allFiles }),
    })
