import { createRoute, z } from "@hono/zod-openapi"
import { Context } from "hono"
import { describe, expect, it } from "vitest"

import { respond } from "./response"

const itemSchema = z.object({
    id: z.uuid(),
    title: z.string(),
    tags: z.array(z.string()).default([]),
})

const itemRoute = createRoute({
    method: "post",
    path: "/items",
    responses: {
        200: {
            content: { "application/json": { schema: itemSchema } },
            description: "Item read",
        },
        201: {
            content: { "application/json": { schema: itemSchema } },
            description: "Item created",
        },
    },
})

/**
 * @description Builds a request context targeting the `/items` route
 */
const newContext = (): Context => new Context(new Request("http://localhost/items"))

/**
 * @description Builds an item payload matching `itemSchema`
 * @remarks Yields a new `id` on every call
 */
const mockItem = () => ({
    id: crypto.randomUUID(),
    title: "Ada",
    tags: ["book"],
})

describe("respond", () => {
    it("should send the schema output with the given status", async () => {
        const item = mockItem()

        const res = respond(newContext(), itemRoute, 200, item)

        expect(res.status).toBe(200)
        expect(await res.json()).toStrictEqual(item)
    })

    it("should use the status that the caller passes", () => {
        expect(respond(newContext(), itemRoute, 201, mockItem()).status).toBe(201)
    })

    it("should strip keys that the schema does not declare", async () => {
        const item = { ...mockItem(), passwordHash: "secret" }

        const res = respond(newContext(), itemRoute, 200, item)

        expect(await res.json()).not.toHaveProperty("passwordHash")
    })

    it("should apply the defaults of the schema", async () => {
        const itemWithoutTags = { id: crypto.randomUUID(), title: "Ada" }

        const res = respond(newContext(), itemRoute, 200, itemWithoutTags)

        expect(await res.json()).toStrictEqual({ ...itemWithoutTags, tags: [] })
    })

    it("should throw when the data violates the schema", () => {
        const item = { ...mockItem(), id: "not-a-uuid" }

        expect(() => respond(newContext(), itemRoute, 200, item)).toThrow("Invalid UUID")
    })
})
