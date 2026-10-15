import { z } from "@hono/zod-openapi"
import { isSemver } from "shared/semver"

import { customErrorParamsSchema } from "./custom-errors"

/**
 * @remarks Rejects a value that `semver` cannot compare. `1.4.0` passes and `1.4`
 * does not
 */
export const semverSchema = z
    .string()
    .nonempty()
    .refine(isSemver, {
        params: customErrorParamsSchema.encode({
            errorCode: "not-semver",
            message: "must be a semver version, for example 1.4.0",
        }),
    })
    .brand<"Semver">()
export type Semver = z.infer<typeof semverSchema>
