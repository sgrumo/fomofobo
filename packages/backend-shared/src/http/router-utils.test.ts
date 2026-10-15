import { createRoute, z } from "@hono/zod-openapi"
import { describe, expect, it } from "vitest"

import { createRouter } from "./router-utils"

const itemSchema = z.object({ title: z.string().min(1) })

const createItemRoute = createRoute({
    method: "post",
    path: "/items",
    request: {
        body: {
            required: true,
            content: { "application/json": { schema: itemSchema } },
        },
    },
    responses: {
        201: {
            content: { "application/json": { schema: itemSchema } },
            description: "Item created",
        },
    },
})

/**
 * @description Builds a router serving `createItemRoute`, echoing the validated body
 */
const newRouter = () =>
    createRouter().openapi(createItemRoute, c => c.json(c.req.valid("json"), 201))

/**
 * @description Sends the body as JSON to `/items`
 * @param body Request body
 */
const postItem = async (body: unknown) =>
    await newRouter().request("/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    })

describe("createRouter", () => {
    it("should pass a valid request to the handler", async () => {
        const res = await postItem({ title: "Ada" })

        expect(res.status).toBe(201)
        expect(await res.json()).toStrictEqual({ title: "Ada" })
    })

    it("should answer an invalid request with the API error body", async () => {
        const res = await postItem({ title: "" })

        expect(res.status).toBe(400)
        expect(await res.json()).toMatchObject({ code: "InvalidRequest", status: 400 })
    })
})
