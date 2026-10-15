import { MAX_UPLOAD_SIZE_BYTES } from "models"
import { describe, expect, it } from "vitest"

import { validateUploadFile } from "./validate-upload-file"

/**
 * @description Builds a `File` of the size and content type
 * @param bytes Size of the file content
 * @param type Content type of the file
 */
const fileOfSize = (bytes: number, type: string): File =>
    new File([new Uint8Array(bytes)], "sample", { type })

describe("validateUploadFile", () => {
    it("accepts a file within the size limit and an allowed content type", () => {
        expect(validateUploadFile(fileOfSize(1024, "image/png"))).toStrictEqual({
            success: true,
            value: undefined,
        })
    })

    it("rejects a file larger than the maximum", () => {
        expect(
            validateUploadFile(fileOfSize(MAX_UPLOAD_SIZE_BYTES + 1, "image/png")),
        ).toStrictEqual({ success: false, error: "too-large" })
    })

    it("rejects a disallowed content type", () => {
        expect(validateUploadFile(fileOfSize(1024, "text/plain"))).toStrictEqual({
            success: false,
            error: "disallowed-type",
        })
    })

    it("checks size before content type", () => {
        expect(
            validateUploadFile(fileOfSize(MAX_UPLOAD_SIZE_BYTES + 1, "text/plain")),
        ).toStrictEqual({ success: false, error: "too-large" })
    })
})
