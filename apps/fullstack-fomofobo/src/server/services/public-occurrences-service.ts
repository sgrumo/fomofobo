import "server-only"
import { boundingBox } from "domain/bounding-box"
import { localDateOf } from "domain/local-format"
import { PLATFORM_TIME_ZONE, SEARCH_RADIUS_METERS } from "domain/platform"
import type {
    OccurrenceDetail,
    OccurrenceLookupQuery,
    OccurrenceRef,
    OccurrenceSummary,
    PermanentVenueSummary,
    PublicSearchQuery,
    PublicSearchResponse,
} from "models"
import { unstable_cache } from "next/cache"
import type { StrictOmit } from "shared/types"
import type {
    PublicOccurrencesStorage,
    SavesStorage,
    StoredOccurrenceSummary,
    StoredPermanentVenue,
} from "storage"

import { dateWindow } from "@/lib/events/date-window"
import { MAX_PERMANENT_VENUE_RESULTS, MAX_SEARCH_RESULTS } from "@/lib/platform/platform"

import { eventTag, PUBLIC_TAG } from "../cache"
import { appError } from "../errors"
import { photoUrl } from "./photos-service"
import type { SettingsService } from "./settings-service"

/**
 * @description Returns the count of saves the public app shows: the count at the threshold or above, else `null`
 * @param saveCount Saves of the occurrence
 * @param threshold Participant threshold of the platform settings
 */
const interestedCountOf = (saveCount: number, threshold: number): number | null =>
    saveCount >= threshold ? saveCount : null

export class PublicOccurrencesService {
    private readonly occurrencesStorage: PublicOccurrencesStorage
    private readonly savesStorage: SavesStorage
    private readonly settings: SettingsService
    private readonly photosPublicBaseUrl: string
    private readonly fallbackImagesBaseUrl: string
    public constructor(
        occurrencesStorage: PublicOccurrencesStorage,
        savesStorage: SavesStorage,
        settings: SettingsService,
        photosPublicBaseUrl: string,
        fallbackImagesBaseUrl: string,
    ) {
        this.occurrencesStorage = occurrencesStorage
        this.savesStorage = savesStorage
        this.settings = settings
        this.photosPublicBaseUrl = photosPublicBaseUrl
        this.fallbackImagesBaseUrl = fallbackImagesBaseUrl
    }

    /**
     * @description Fetches the visible occurrences of the area and the date window, live first, the permanent venues of the area, and the counts per category
     * @param query Center, text, categories and date filter
     * @param now Instant that sets today, the status order and the occurrences ended too long ago
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
        const endedVisibleSince = await this.settings.endedVisibleSince(now)
        const center = { latitude: query.lat, longitude: query.lng }
        const result = await this.occurrencesStorage.search({
            window: {
                from: new Date(
                    Math.max(window.from.getTime(), endedVisibleSince.getTime()),
                ),
                to: window.to,
            },
            center,
            radiusMeters: SEARCH_RADIUS_METERS,
            box: boundingBox(center, SEARCH_RADIUS_METERS),
            q: query.q,
            categoryIds: query.categoryIds,
            free: query.free,
            now,
            limit: MAX_SEARCH_RESULTS,
            permanentVenueLimit: MAX_PERMANENT_VENUE_RESULTS,
            onePerEvent: true,
        })
        return {
            window: { from: window.from.toISOString(), to: window.to.toISOString() },
            occurrences: await this.summariesOf(result.occurrences),
            permanentVenues: result.permanentVenues.map(venue =>
                this.toPermanentVenue(venue),
            ),
            categoryCounts: result.categoryCounts,
            truncated: result.truncated,
        }
    }

    /**
     * @description Fetches one visible occurrence with its photos and links from the cache of public reads, and its count of saves outside it
     * @param ref Event and local start date, any date for a single event
     * @param now Instant that hides an occurrence ended too long ago
     */
    public async get(ref: OccurrenceRef, now: Date): Promise<OccurrenceDetail> {
        const detail = await unstable_cache(
            async () => {
                const stored = await this.occurrencesStorage.findDetail(ref)
                return stored === null
                    ? null
                    : {
                          ...this.baseSummaryOf(stored),
                          venue: { ...stored.venue, address: stored.venueAddress },
                          photos: stored.photos.map(photo => ({
                              id: photo.id,
                              url: photoUrl(this.photosPublicBaseUrl, photo.objectKey),
                              position: photo.position,
                          })),
                          externalLinks: stored.externalLinks,
                          capacity: stored.capacity,
                      }
            },
            ["occurrence-detail-v3", ref.eventId, ref.date],
            { tags: [PUBLIC_TAG, eventTag(ref.eventId)] },
        )()
        const endedVisibleSince = await this.settings.endedVisibleSince(now)
        if (detail === null || Date.parse(detail.endsAt) <= endedVisibleSince.getTime()) {
            throw appError(
                "OccurrenceNotFound",
                `Occurrence ${ref.eventId} ${ref.date} not found`,
            )
        }
        // Read beside the cached detail: a save expires no cache.
        const [saveCount, { participantThreshold }] = await Promise.all([
            this.savesStorage.countFor({ eventId: detail.eventId, date: detail.date }),
            this.settings.get(),
        ])
        return {
            ...detail,
            interestedCount: interestedCountOf(saveCount, participantThreshold),
        }
    }

    /**
     * @description Fetches the visible occurrences of saved refs, in ref order, without the refs that are not visible
     * @param query Refs as `<eventId>:<date>` keys
     * @param now Instant that hides an occurrence ended too long ago
     */
    public async lookup(
        query: OccurrenceLookupQuery,
        now: Date,
    ): Promise<OccurrenceSummary[]> {
        const refs = query.ref.map(key => {
            const separator = key.indexOf(":")
            return { eventId: key.slice(0, separator), date: key.slice(separator + 1) }
        })
        const occurrences = await this.occurrencesStorage.lookup(
            refs,
            await this.settings.endedVisibleSince(now),
        )
        return await this.summariesOf(occurrences)
    }

    /**
     * @description Maps stored occurrences to their public summaries, with the count of saves at the participant threshold or above
     * @param occurrences Stored occurrences
     */
    public async summariesOf(
        occurrences: StoredOccurrenceSummary[],
    ): Promise<OccurrenceSummary[]> {
        const { participantThreshold } = await this.settings.get()
        return occurrences.map(occurrence => ({
            ...this.baseSummaryOf(occurrence),
            interestedCount: interestedCountOf(
                occurrence.saveCount,
                participantThreshold,
            ),
        }))
    }

    /**
     * @description Maps a stored occurrence to its public summary with no count, with the URL of its cover
     * @param occurrence Stored occurrence
     */
    private baseSummaryOf(
        occurrence: StoredOccurrenceSummary,
    ): StrictOmit<OccurrenceSummary, "interestedCount"> {
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
            coverPhotoUrl: this.coverUrlOf(occurrence),
            priceScheme: occurrence.priceScheme,
        }
    }

    /**
     * @description Maps a stored permanent venue to its summary, with the URL of its cover
     * @param venue Stored permanent venue
     */
    private toPermanentVenue(venue: StoredPermanentVenue): PermanentVenueSummary {
        const { coverObjectKey, ...rest } = venue
        return {
            ...rest,
            coverPhotoUrl:
                coverObjectKey === null
                    ? null
                    : photoUrl(this.photosPublicBaseUrl, coverObjectKey),
        }
    }

    /**
     * @description Returns the URL of the cover of an occurrence: the first photo, else the venue cover, else the primary category image, else the generated image of the category icon
     * @param occurrence Stored occurrence
     */
    private coverUrlOf(occurrence: StoredOccurrenceSummary): string {
        const key =
            occurrence.coverObjectKey ??
            occurrence.fallback.venueCoverObjectKey ??
            occurrence.fallback.categoryImageObjectKey
        return key === null
            ? `${this.fallbackImagesBaseUrl}${occurrence.fallback.categoryIcon}.png`
            : photoUrl(this.photosPublicBaseUrl, key)
    }
}
