import "server-only"
import { HttpStatus, occurrenceRefSchema } from "models"
import type { OccurrenceDetail } from "models"
import { notFound } from "next/navigation"
import { cache } from "react"

import { serverApi } from "@/lib/api/server/api"
import { ApiTransportError } from "@/lib/api/transport-error"

/**
 * @description Fetches the visible occurrence the detail URL names, once per request
 * @param eventId Event segment of the URL
 * @param date Date segment of the URL
 * @throws When the segments are malformed or the occurrence is not visible, through
 * `notFound()`
 */
export const readOccurrence = cache(
    async (eventId: string, date: string): Promise<OccurrenceDetail> => {
        const ref = occurrenceRefSchema.safeParse({ eventId, date })
        if (!ref.success) {
            notFound()
        }

        try {
            return await serverApi.getOccurrence({ params: ref.data, query: {} })
        } catch (error) {
            if (
                error instanceof ApiTransportError &&
                error.status === HttpStatus.NotFound
            ) {
                notFound()
            }
            throw error
        }
    },
)
