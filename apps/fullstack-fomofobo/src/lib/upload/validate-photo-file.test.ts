import { MAX_UPLOAD_SIZE_BYTES } from "models"
import { describe, expect, it } from "vitest"

import { validatePhotoFile } from "./validate-photo-file"

/**
 * @description Builds a `File` of the size and content type
 * @param bytes Size of the file content
 * @param type Content type of the file
 */
const fileOfSize = (bytes: number, type: string): File =>
    new File([new Uint8Array(bytes)], "sample", { type })

describe("validatePhotoFile", () => {
    it("accepts an image within the size limit, with its content type", () => {
        expect(validatePhotoFile(fileOfSize(1024, "image/webp"))).toStrictEqual({
            success: true,
            value: "image/webp",
        })
    })

    it("rejects a file larger than the maximum", () => {
        expect(
            validatePhotoFile(fileOfSize(MAX_UPLOAD_SIZE_BYTES + 1, "image/png")),
        ).toStrictEqual({ success: false, error: "too-large" })
    })

    it("rejects a type the upload accepts but a photo does not", () => {
        for (const type of ["application/pdf", "image/gif", "text/plain"]) {
            expect(validatePhotoFile(fileOfSize(1024, type))).toStrictEqual({
                success: false,
                error: "disallowed-type",
            })
        }
    })
})
