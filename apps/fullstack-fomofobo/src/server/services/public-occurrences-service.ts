import "server-only"
import type {
    OccurrenceDetail,
    OccurrenceLookupQuery,
    OccurrenceRef,
    OccurrenceSummary,
    PublicSearchQuery,
    PublicSearchResponse,
} from "models"
import { unstable_cache } from "next/cache"
import type { PublicOccurrencesStorage, StoredOccurrenceSummary } from "storage"

import { dateWindow, localDateOf } from "@/lib/events/date-window"
import { boundingBox } from "@/lib/geo/bounding-box"
import {
    MAX_SEARCH_RESULTS,
    PLATFORM_TIME_ZONE,
    SEARCH_RADIUS_METERS,
} from "@/lib/platform/platform"

import { eventTag, PUBLIC_TAG } from "../cache"
import { appError } from "../errors"
import { photoUrl } from "./photos-service"

export class PublicOccurrencesService {
    private readonly occurrencesStorage: PublicOccurrencesStorage
    private readonly photosPublicBaseUrl: string
    public constructor(
        occurrencesStorage: PublicOccurrencesStorage,
        photosPublicBaseUrl: string,
    ) {
        this.occurrencesStorage = occurrencesStorage
        this.photosPublicBaseUrl = photosPublicBaseUrl
    }

    /**
     * @description Fetches the visible occurrences of the area and the date window, live first, with the counts per category
     * @param query Center, text, categories and date filter
     * @param now Instant that sets today and the status order
     */
    public async search(
        query: PublicSearchQuery,
        now: Date,
    ): Promise<PublicSearchResponse> {
        // PLACEHOLDER(OP-09): a range starts today at the earliest
        if (
            query.date === "range" &&
            query.from !== undefined &&
            query.from < localDateOf(now, PLATFORM_TIME_ZONE)
        ) {
            throw appError("PastDateRange", "The date range starts before today")
        }

        const window = dateWindow(query, now, PLATFORM_TIME_ZONE)
        const center = { latitude: query.lat, longitude: query.lng }
        const result = await this.occurrencesStorage.search({
            window,
            center,
            radiusMeters: SEARCH_RADIUS_METERS,
            box: boundingBox(center, SEARCH_RADIUS_METERS),
            q: query.q,
            categoryIds: query.categoryIds,
            now,
            limit: MAX_SEARCH_RESULTS,
            onePerEvent: true,
        })
        return {
            window: { from: window.from.toISOString(), to: window.to.toISOString() },
            occurrences: result.occurrences.map(occurrence => this.toSummary(occurrence)),
            categoryCounts: result.categoryCounts,
            truncated: result.truncated,
        }
    }

    /**
     * @description Fetches one visible occurrence with its photos and links, from the cache of public reads
     * @param ref Event and local start date, any date for a single event
     */
    public async find(ref: OccurrenceRef): Promise<OccurrenceDetail> {
        const detail = await unstable_cache(
            async () => {
                const stored = await this.occurrencesStorage.findDetail(ref)
                return stored === null
                    ? null
                    : {
                          ...this.toSummary(stored),
                          venue: { ...stored.venue, address: stored.venueAddress },
                          photos: stored.photos.map(photo => ({
                              id: photo.id,
                              url: photoUrl(this.photosPublicBaseUrl, photo.objectKey),
                              position: photo.position,
                          })),
                          externalLinks: stored.externalLinks,
                      }
            },
            ["occurrence-detail", ref.eventId, ref.date],
            { tags: [PUBLIC_TAG, eventTag(ref.eventId)] },
        )()
        if (detail === null) {
            throw appError(
                "OccurrenceNotFound",
                `Occurrence ${ref.eventId} ${ref.date} not found`,
            )
        }
        return detail
    }

    /**
     * @description Fetches the visible occurrences of saved refs, in ref order, without the refs that are not visible
     * @param query Refs as `<eventId>:<date>` keys
     */
    public async lookup(query: OccurrenceLookupQuery): Promise<OccurrenceSummary[]> {
        const refs = query.ref.map(key => {
            const separator = key.indexOf(":")
            return { eventId: key.slice(0, separator), date: key.slice(separator + 1) }
        })
        const occurrences = await this.occurrencesStorage.lookup(refs)
        return occurrences.map(occurrence => this.toSummary(occurrence))
    }

    /**
     * @description Maps a stored occurrence to its public summary, with the URL of its cover
     * @param occurrence Stored occurrence
     */
    private toSummary(occurrence: StoredOccurrenceSummary): OccurrenceSummary {
        return {
            eventId: occurrence.eventId,
            date: occurrence.localDate,
            startsAt: occurrence.startsAt.toISOString(),
            endsAt: occurrence.endsAt.toISOString(),
            title: occurrence.title,
            description: occurrence.description,
            venue: occurrence.venue,
            categoryIds: occurrence.categoryIds,
            primaryCategoryId: occurrence.primaryCategoryId,
            coverPhotoUrl:
                occurrence.coverObjectKey === null
                    ? null
                    : photoUrl(this.photosPublicBaseUrl, occurrence.coverObjectKey),
            price: occurrence.price,
        }
    }
}
