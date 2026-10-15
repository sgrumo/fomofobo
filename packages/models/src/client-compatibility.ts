import { z } from "@hono/zod-openapi"

export const clientPlatformSchema = z.enum(["ios", "android"])
export type ClientPlatform = z.infer<typeof clientPlatformSchema>

/**
 * @remarks `update-required` and `maintenance` share one version threshold. The
 * store availability of the release selects between them: a store link is
 * useless while the store holds nothing to install
 */
export const clientActionSchema = z.enum([
    "ok",
    "update-optional",
    "update-required",
    "maintenance",
])
export type ClientAction = z.infer<typeof clientActionSchema>

/**
 * @remarks Holds each value on its own, so a client that knows only one of the
 * two still reports it. The backend then sees a partial identity instead of an
 * empty request. A present value stays strict, and only an absent one passes
 */
export const clientCompatibilityHeadersSchema = z.object({
    "x-app-platform": clientPlatformSchema.optional(),
    "x-app-version": z.string().min(1).optional(),
})
export type ClientCompatibilityHeaders = z.infer<typeof clientCompatibilityHeadersSchema>

/**
 * @remarks `storeUrl` is absent for `ok` and for `maintenance`. It travels with
 * the action and never alone, so a maintenance screen cannot show a store button
 */
export const clientCompatibilitySchema = z.object({
    action: clientActionSchema,
    storeUrl: z.string().optional(),
})
export type ClientCompatibility = z.infer<typeof clientCompatibilitySchema>
