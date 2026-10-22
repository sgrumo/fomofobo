import { z } from "@hono/zod-openapi"

export const instagramUrlSchema = z.url({
    protocol: /^https$/u,
    hostname: /^(?:www\.)?instagram\.com$/u,
})

export const facebookUrlSchema = z.url({
    protocol: /^https$/u,
    hostname: /^(?:(?:www|m)\.)?facebook\.com$/u,
})
