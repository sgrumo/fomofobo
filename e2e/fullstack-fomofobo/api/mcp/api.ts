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
