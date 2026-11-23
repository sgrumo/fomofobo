import { describe, expect, it } from "vitest"
import { z } from "zod"

import { appError } from "../errors"
import { runTool } from "./mcp-tool-result"

describe("runTool", () => {
    it("should answer the schema output of the call as JSON text, unknown keys stripped", async () => {
        const schema = z.object({ id: z.string(), total: z.number() })

        await expect(
            runTool("t", schema, () =>
                Promise.resolve({ id: "a", total: 2, secretKey: "k" }),
            ),
        ).resolves.toStrictEqual({
            content: [{ type: "text", text: '{"id":"a","total":2}' }],
        })
    })

    it("should answer a business error with its code and message", async () => {
        await expect(
            runTool("t", z.unknown(), () =>
                Promise.reject(appError("VenueNotFound", "Venue v not found")),
            ),
        ).resolves.toStrictEqual({
            isError: true,
            content: [{ type: "text", text: "VenueNotFound: Venue v not found" }],
        })
    })

    it("should hide any other error behind a generic message", async () => {
        const result = await runTool("t", z.unknown(), () =>
            Promise.reject(
                new Error("SQLITE_BUSY: database is locked at libsql://secret-host"),
            ),
        )

        expect(result).toStrictEqual({
            isError: true,
            content: [
                { type: "text", text: "The tool failed on the server. Try again later." },
            ],
        })
    })
})
