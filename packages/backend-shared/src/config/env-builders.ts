import { z } from "@hono/zod-openapi"

export const s3EndpointSchema = z
    .string()
    .nonempty()
    .pipe(
        z.url({
            error: "must be a full URL including the scheme, for example https://s3.example.com",
        }),
    )
