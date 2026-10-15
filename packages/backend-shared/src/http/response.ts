import type { RouteConfig, z } from "@hono/zod-openapi"
import type { Context, TypedResponse } from "hono"
import type { ContentfulStatusCode } from "hono/utils/http-status"
import type { JSONParsed } from "hono/utils/types"

/**
 * @description Returns the JSON schema the route declares for the status
 * @template R Route configuration
 * @template S Response status key
 */
type JsonSchema<
    R extends RouteConfig,
    S extends keyof R["responses"],
> = R["responses"][S] extends {
    content: { "application/json": { schema: infer Schema extends z.ZodType } }
}
    ? Schema
    : never

/**
 * @description Returns a JSON response holding the schema output for the status
 * @template R Route configuration
 * @template S Response status key
 * @param c Request context
 * @param route Route declaring the response schema
 * @param status Status sent with the body
 * @param data Payload parsed by the schema
 * @remarks Sends the schema output, so unknown keys are stripped and transforms run
 */
export const respond = <
    R extends RouteConfig,
    S extends Extract<keyof R["responses"], ContentfulStatusCode>,
>(
    c: Context,
    route: R & {
        responses: Record<
            S,
            { content: { "application/json": { schema: JsonSchema<R, S> } } }
        >
    },
    status: S,
    data: z.input<JsonSchema<R, S>>,
): Response & TypedResponse<JSONParsed<z.output<JsonSchema<R, S>>>, S, "json"> => {
    const { schema } = route.responses[status].content["application/json"]
    return c.json(schema.parse(data), status)
}
