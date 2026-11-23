import "server-only"
import type { CallToolResult } from "@modelcontextprotocol/server"
import { logger } from "backend-shared"
import { ApplicationError, serializeError } from "backend-shared/http"
import type { z } from "zod"

/**
 * @description Builds the tool result that carries a value as JSON text
 * @param value Answer of the service
 */
const toTextResult = (value: unknown): CallToolResult => ({
    content: [{ type: "text", text: JSON.stringify(value) }],
})

/**
 * @description Builds the tool error that the model reads to fix its call
 * @param text Explanation of the failure
 */
const toErrorResult = (text: string): CallToolResult => ({
    isError: true,
    content: [{ type: "text", text }],
})

/**
 * @description Runs one tool call and maps its answer or its failure to a tool result
 * @template TSchema Response schema of the matching REST route
 * @param tool Name of the tool, for the log
 * @param schema Response schema, whose output the tool answers
 * @param call Service call of the tool
 */
export const runTool = async <TSchema extends z.ZodType>(
    tool: string,
    schema: TSchema,
    call: () => Promise<z.input<TSchema>>,
): Promise<CallToolResult> => {
    try {
        return toTextResult(schema.parse(await call()))
    } catch (error) {
        if (error instanceof ApplicationError) {
            return toErrorResult(`${error.code}: ${error.message}`)
        }
        logger.error(`MCP tool ${tool} failed`, { error: serializeError(error) })
        return toErrorResult("The tool failed on the server. Try again later.")
    }
}
