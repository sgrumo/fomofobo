import { expectApiError, expectRawStatus, expectStatus } from "e2e-kit/assertions"
import { anyHttpUrl } from "e2e-kit/matchers"
import { describe, expect, it } from "vitest"

import { downloadFile } from "./api"
import { createFinalizedFile, mockPngBytes } from "./utils"

describe("files Download", () => {
    it("should mint a download URL that serves the uploaded bytes", async () => {
        const file = await createFinalizedFile()

        const res = await downloadFile({ pathParams: { id: file.id } })
        expectStatus(res, 200)
        expect(res.data).toStrictEqual({ url: anyHttpUrl })

        const objectRes = await fetch(res.data.url)
        expectRawStatus(objectRes, 200)
        expect(new Uint8Array(await objectRes.arrayBuffer())).toStrictEqual(
            mockPngBytes(),
        )
    })

    it("should return 404 for a non-existent file", async () => {
        const res = await downloadFile({ pathParams: { id: crypto.randomUUID() } })
        expectApiError(res, 404, { code: "ItemNotFound" })
    })
})
