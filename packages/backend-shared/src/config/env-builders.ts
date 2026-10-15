import { z } from "@hono/zod-openapi"

export const portSchema = z
    .string()
    .nonempty()
    .transform(Number)
    .pipe(z.number({ error: "must be a number" }).int().min(1).max(65_535))

export const s3EndpointSchema = z
    .string()
    .nonempty()
    .pipe(
        z.url({
            error: "must be a full URL including the scheme, for example https://s3.example.com",
        }),
    )
