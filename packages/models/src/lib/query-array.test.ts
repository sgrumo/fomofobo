import { z } from "@hono/zod-openapi"
import { describe, expect, it } from "vitest"

import { queryArraySchema } from "./query-array"

const schema = queryArraySchema(z.uuid(), 2)

describe("queryArraySchema", () => {
    it("reads a key that appears once as an array of one value", () => {
        const id = crypto.randomUUID()

        expect(schema.parse(id)).toStrictEqual([id])
    })

    it("reads a repeated key as an array", () => {
        const ids = [crypto.randomUUID(), crypto.randomUUID()]

        expect(schema.parse(ids)).toStrictEqual(ids)
    })

    it("rejects more values than the cap", () => {
        expect(
            schema.safeParse([
                crypto.randomUUID(),
                crypto.randomUUID(),
                crypto.randomUUID(),
            ]).success,
        ).toBe(false)
    })
})
