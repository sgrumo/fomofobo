import { dateFilterKindSchema, localDateSchema } from "models"
import { z } from "zod"

/**
 * @description Builds the codec of one coordinate read from a URL
 * @param limit Largest absolute value of the coordinate
 */
const coordinateCodec = (limit: number) =>
    z.codec(z.string().regex(z.regexes.number), z.number().min(-limit).max(limit), {
        decode: Number,
        encode: value => value.toString(),
    })

/**
 * @remarks Mirrors the web map URL query key for key, so a web link opens the same app screen,
 * and decodes a malformed value to undefined
 */
export const mapQuerySchema = z.object({
    lat: coordinateCodec(90).optional().catch(undefined),
    lng: coordinateCodec(180).optional().catch(undefined),
    place: z.string().trim().min(1).optional().catch(undefined),
    q: z.string().trim().min(1).optional().catch(undefined),
    category: z.uuid().optional().catch(undefined),
    free: z.stringbool().optional().catch(undefined),
    date: dateFilterKindSchema.optional().catch(undefined),
    from: localDateSchema.optional().catch(undefined),
    to: localDateSchema.optional().catch(undefined),
    showLive: z.stringbool().optional().catch(undefined),
    showUpcoming: z.stringbool().optional().catch(undefined),
    showPermanent: z.stringbool().optional().catch(undefined),
    showEnded: z.stringbool().optional().catch(undefined),
    event: z.uuid().optional().catch(undefined),
    occurrence: localDateSchema.optional().catch(undefined),
    venue: z.uuid().optional().catch(undefined),
    detail: z.stringbool().optional().catch(undefined),
})

export type MapQuery = z.output<typeof mapQuerySchema>
