import { z } from "@hono/zod-openapi"

export const localDateSchema = z.iso.date()
export type LocalDate = z.infer<typeof localDateSchema>

/**
 * @remarks Holds a wall-clock time of the platform time zone, minute precision, with no
 * offset: the regex rejects the `Z` that `local` accepts
 */
export const localDateTimeSchema = z.iso
    .datetime({ local: true, precision: -1 })
    .regex(/\d$/u)
export type LocalDateTime = z.infer<typeof localDateTimeSchema>

export const instantSchema = z.iso.datetime({ offset: true })
export type Instant = z.infer<typeof instantSchema>
