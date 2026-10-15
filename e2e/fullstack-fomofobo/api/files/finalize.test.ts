import { expectApiError, expectRawStatus, expectStatus } from "e2e-kit/assertions"
import { anyIsoDateTime, anyUuid } from "e2e-kit/matchers"
import { describe, expect, it } from "vitest"

import { finalizeFile, getFiles, requestUpload, uploadToPresignedPost } from "./api"
import { mockPngBytes, mockUploadRequest } from "./utils"

describe("files Finalize", () => {
    it("should finalize a real uploaded object and return its metadata", async () => {
        const bytes = mockPngBytes()
        const request = mockUploadRequest({
            contentType: "image/png",
            sizeBytes: bytes.length,
        })

        const ticketRes = await requestUpload({ body: request })
        expectStatus(ticketRes, 200)

        const uploadStatus = await uploadToPresignedPost(
            ticketRes.data,
            bytes,
            request.contentType,
            request.fileName,
        )
        expectRawStatus({ status: uploadStatus }, 204)

        const res = await finalizeFile({
            body: { key: ticketRes.data.key, fileName: request.fileName },
        })
        expectStatus(res, 201)

        expect(res.data).toStrictEqual({
            id: anyUuid,
            objectKey: ticketRes.data.key,
            fileName: request.fileName,
            contentType: request.contentType,
            sizeBytes: bytes.length,
            createdAt: anyIsoDateTime,
        })

        const listRes = await getFiles({})
        expectStatus(listRes, 200)
        expect(listRes.data).toStrictEqual([res.data])
    })

    it("should reject a key not scoped under files/", async () => {
        const res = await finalizeFile({
            body: { key: `not-files/${crypto.randomUUID()}/x.png`, fileName: "x.png" },
        })
        expectApiError(res, 400, {
            code: "InvalidRequest",
            message: "Object key is not in the files namespace",
        })
    })

    it("should reject a well-formed key that was never uploaded", async () => {
        const res = await finalizeFile({
            body: {
                key: `files/${crypto.randomUUID()}/x.png`,
                fileName: "x.png",
            },
        })
        expectApiError(res, 400, {
            code: "InvalidRequest",
            message: "Uploaded object not found",
        })
    })
})
