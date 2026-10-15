import { MAX_UPLOAD_SIZE_BYTES, uploadContentTypeSchema } from "models"
import { err, ok } from "shared/result"
import type { Result } from "shared/result"

export type UploadFileValidationError = "too-large" | "disallowed-type"

/**
 * @description Returns an ok result for an allowed file, or the rejection reason as err
 * @param file File checked
 */
export const validateUploadFile = (
    file: File,
): Result<void, UploadFileValidationError> => {
    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
        return err("too-large")
    }
    if (!uploadContentTypeSchema.validate(file.type)) {
        return err("disallowed-type")
    }
    return ok(undefined)
}
