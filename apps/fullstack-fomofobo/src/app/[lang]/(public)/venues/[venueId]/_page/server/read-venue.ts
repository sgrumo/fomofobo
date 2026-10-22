import "server-only"
import { HttpStatus, venueSchema } from "models"
import type { PublicVenue } from "models"
import { notFound } from "next/navigation"
import { cache } from "react"

import { serverApi } from "@/lib/api/server/api"
import { ApiTransportError } from "@/lib/api/transport-error"

/**
 * @description Fetches the venue the URL names, with its upcoming events, once per request
 * @param venueId Venue segment of the URL
 * @throws When the segment is malformed or the venue is blocked or unknown, through
 * `notFound()`
 */
export const readVenue = cache(async (venueId: string): Promise<PublicVenue> => {
    const id = venueSchema.shape.id.safeParse(venueId)
    if (!id.success) {
        notFound()
    }

    try {
        return await serverApi.getPublicVenue({ params: { venueId: id.data }, query: {} })
    } catch (error) {
        if (error instanceof ApiTransportError && error.status === HttpStatus.NotFound) {
            notFound()
        }
        throw error
    }
})
