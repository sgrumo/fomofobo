import { apiErrorSchema } from "models"

const apiErrorResponseSchema = apiErrorSchema.openapi("ApiError")

interface JsonErrorResponse {
    content: { "application/json": { schema: typeof apiErrorResponseSchema } }
    description: string
}

/**
 * @description Builds a JSON error response carrying the API error schema
 * @param description OpenAPI description of the response
 */
const jsonError = (description: string): JsonErrorResponse => ({
    content: { "application/json": { schema: apiErrorResponseSchema } },
    description,
})

export const badRequestResponse: JsonErrorResponse = jsonError("Invalid input")
/**
 * @description Builds a not-found response naming the missing entity
 * @param entity Entity name written in the description
 */
export const notFoundResponse = (entity: string): JsonErrorResponse =>
    jsonError(`${entity} not found`)
export const conflictResponse = (description: string): JsonErrorResponse =>
    jsonError(description)
export const serviceUnavailableResponse = (description: string): JsonErrorResponse =>
    jsonError(description)
