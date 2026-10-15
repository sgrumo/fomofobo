import { expectApiError, expectRawStatus, expectStatus } from "e2e-kit/assertions"
import { describe, expect, it } from "vitest"

import { deleteFile, downloadFile, getFiles } from "./api"
import { createFinalizedFile } from "./utils"

describe("files Delete", () => {
    it("should delete the metadata and the stored object", async () => {
        const file = await createFinalizedFile()
        const downloadBefore = await downloadFile({ pathParams: { id: file.id } })
        expectStatus(downloadBefore, 200)

        const deleteRes = await deleteFile({ pathParams: { id: file.id } })
        expectStatus(deleteRes, 204)

        const downloadAfter = await downloadFile({ pathParams: { id: file.id } })
        expectApiError(downloadAfter, 404, { code: "ItemNotFound" })

        const listRes = await getFiles({})
        expectStatus(listRes, 200)
        expect(listRes.data).toStrictEqual([])

        // A URL minted before the delete proves the object left the store.
        const objectRes = await fetch(downloadBefore.data.url)
        expectRawStatus(objectRes, 404)
    })

    it("should return 404 when deleting a non-existent file", async () => {
        const res = await deleteFile({ pathParams: { id: crypto.randomUUID() } })
        expectApiError(res, 404, { code: "ItemNotFound" })
    })
})
