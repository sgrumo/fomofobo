import { expectStatus } from "e2e-kit/assertions"
import { describe, expect, it } from "vitest"

import { getFiles } from "./api"
import { createFinalizedFile } from "./utils"

describe("files List", () => {
    it("should return every finalized file", async () => {
        const file = await createFinalizedFile()

        const res = await getFiles({})
        expectStatus(res, 200)

        expect(res.data).toStrictEqual([file])
    })
})
