import axios from "axios"
import { z } from "zod"

import { mcpResourceUrl } from "../oauth/utils"

/**
 * @description Sends one JSON-RPC request to the MCP endpoint and returns the response
 * @param token Access token, none for an unauthenticated call
 * @param method JSON-RPC method
 * @param params JSON-RPC params
 */
export const callMcp = (
    token: string | undefined,
    method: string,
    params: Record<string, unknown> = {},
) =>
    axios.post(
        mcpResourceUrl(),
        { jsonrpc: "2.0", id: 1, method, params },
        {
            headers: {
                Accept: "application/json, text/event-stream",
                "MCP-Protocol-Version": "2025-06-18",
                ...(token === undefined ? {} : { Authorization: `Bearer ${token}` }),
            },
            validateStatus: () => true,
        },
    )

/**
 * @description Returns the JSON-RPC message of an MCP answer, which comes as one SSE event
 * @param data Body of the answer
 */
export const rpcMessageOf = (data: unknown): unknown =>
    JSON.parse(
        z
            .string()
            .parse(data)
            .split("\n")
            .find(line => line.startsWith("data: "))
            ?.slice("data: ".length) ?? "null",
    )

const toolResultMessageSchema = z.object({
    result: z.object({
        isError: z.boolean().optional(),
        content: z.array(z.object({ type: z.literal("text"), text: z.string() })),
    }),
})

/**
 * @description Returns the JSON value of a text
 * @param text JSON text
 */
const parseJson = (text: string): unknown => JSON.parse(text)

/**
 * @description Calls one MCP tool and returns its answer: the JSON value, or the error text
 * @param token Access token of an Admin
 * @param name Name of the tool
 * @param args Arguments of the call
 */
export const callTool = async (
    token: string,
    name: string,
    args: Record<string, unknown> = {},
): Promise<{ isError: false; value: unknown } | { isError: true; text: string }> => {
    const res = await callMcp(token, "tools/call", { name, arguments: args })
    const { result } = toolResultMessageSchema.parse(rpcMessageOf(res.data))
    const text = result.content.map(part => part.text).join("\n")
    return result.isError === true
        ? { isError: true, text }
        : { isError: false, value: parseJson(text) }
}

/**
 * @description Returns the value of a tool answer
 * @param result Answer of `callTool`
 * @throws When the tool answered an error, with its text
 */
export const toolValueOf = (result: Awaited<ReturnType<typeof callTool>>): unknown => {
    if (result.isError) {
        throw new TypeError(`Tool error: ${result.text}`)
    }
    return result.value
}
