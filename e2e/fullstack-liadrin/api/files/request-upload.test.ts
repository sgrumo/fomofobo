import { expectApiError, expectRawStatus, expectStatus } from "e2e-kit/assertions"
import { anyHttpUrl } from "e2e-kit/matchers"
import { MAX_UPLOAD_SIZE_BYTES } from "models"
import { describe, expect, it } from "vitest"

import { requestUpload, requestUploadRaw, uploadToPresignedPost } from "./api"
import { mockPngBytes, mockUploadRequest } from "./utils"

describe("files RequestUpload", () => {
    it("should return a presigned ticket that accepts the upload", async () => {
        const request = mockUploadRequest()
        const res = await requestUpload({ body: request })
        expectStatus(res, 200)

        expect(res.data).toStrictEqual({
            url: anyHttpUrl,
            fields: expect.objectContaining({
                key: res.data.key,
                "Content-Type": request.contentType,
            }),
            key: expect.stringMatching(/^files\/[\da-f-]{36}\/.+$/u),
        })

        const uploadStatus = await uploadToPresignedPost(
            res.data,
            mockPngBytes(),
            request.contentType,
            request.fileName,
        )
        expectRawStatus({ status: uploadStatus }, 204)
    })

    it("should reject a disallowed content type", async () => {
        const res = await requestUploadRaw({
            fileName: mockUploadRequest().fileName,
            contentType: "text/plain",
            sizeBytes: mockPngBytes().length,
        })
        expectApiError(res, 400, { code: "InvalidRequest" })
    })

    it("should reject a size over the maximum", async () => {
        const res = await requestUpload({
            body: mockUploadRequest({ sizeBytes: MAX_UPLOAD_SIZE_BYTES + 1 }),
        })
        expectApiError(res, 400, { code: "InvalidRequest" })
    })
})
