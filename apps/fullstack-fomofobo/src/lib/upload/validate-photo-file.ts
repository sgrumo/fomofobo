import type { PhotoContentType } from "models"
import { MAX_UPLOAD_SIZE_BYTES, photoContentTypeSchema } from "models"
import { err, ok } from "shared/result"
import type { Result } from "shared/result"

export type PhotoFileValidationError = "too-large" | "disallowed-type"

/**
 * @description Returns the content type of an allowed photo, or the rejection reason as err
 * @param file File picked
 */
export const validatePhotoFile = (
    file: File,
): Result<PhotoContentType, PhotoFileValidationError> => {
    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
        return err("too-large")
    }
    const contentType = photoContentTypeSchema.safeParse(file.type)
    return contentType.success ? ok(contentType.data) : err("disallowed-type")
}
