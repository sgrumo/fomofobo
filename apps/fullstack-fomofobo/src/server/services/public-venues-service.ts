import "server-only"
import type { PublicVenue, VenueHistoryItem, VenueHistoryQuery } from "models"
import { unstable_cache } from "next/cache"
import type { StrictOmit } from "shared/types"
import type { PublicOccurrencesStorage, StoredPublicVenue } from "storage"

import { PUBLIC_TAG, venueTag } from "../cache"
import { appError } from "../errors"
import { photoUrl } from "./photos-service"
import type { PublicOccurrencesService } from "./public-occurrences-service"
import type { Page } from "./to-page"
import { toPage } from "./to-page"

const UPCOMING_EVENTS_LIMIT = 100

export class PublicVenuesService {
    private readonly occurrencesStorage: PublicOccurrencesStorage
    private readonly occurrences: PublicOccurrencesService
    private readonly photosPublicBaseUrl: string
    public constructor(
        occurrencesStorage: PublicOccurrencesStorage,
        occurrences: PublicOccurrencesService,
        photosPublicBaseUrl: string,
    ) {
        this.occurrencesStorage = occurrencesStorage
        this.occurrences = occurrences
        this.photosPublicBaseUrl = photosPublicBaseUrl
    }

    /**
     * @description Fetches a venue that is not blocked, from the cache of public reads, with its upcoming events
     * @param venueId Venue read
     * @param now Instant that sets the occurrences ended and the status order
     */
    public async get(venueId: string, now: Date): Promise<PublicVenue> {
        const [venue, upcoming] = await Promise.all([
            this.findProfile(venueId),
            this.occurrencesStorage.listVenueUpcoming(
                venueId,
                now,
                UPCOMING_EVENTS_LIMIT,
            ),
        ])
        return {
            ...venue,
            upcoming: await this.occurrences.summariesOf(upcoming),
        }
    }

    /**
     * @description Fetches one page of the past events of a venue that is not blocked
     * @param venueId Venue read
     * @param query Page of the history
     * @param now Instant every occurrence of a past event ends at or before
     */
    public async listHistory(
        venueId: string,
        query: VenueHistoryQuery,
        now: Date,
    ): Promise<Page<VenueHistoryItem>> {
        const [, history] = await Promise.all([
            this.findProfile(venueId),
            this.occurrencesStorage.listVenueHistory(venueId, now, query),
        ])
        return toPage(history, query)
    }

    /**
     * @description Fetches the profile of a venue that is not blocked from the cache of public reads, or throws when none matches
     * @param venueId Venue read
     */
    private async findProfile(
        venueId: string,
    ): Promise<StrictOmit<PublicVenue, "upcoming">> {
        const venue = await unstable_cache(
            async () => {
                const stored = await this.occurrencesStorage.findPublicVenue(venueId)
                return stored === null ? null : this.toProfile(stored)
            },
            ["venue-profile-v2", venueId],
            { tags: [PUBLIC_TAG, venueTag(venueId)] },
        )()
        if (venue === null) {
            throw appError("VenueNotFound", `Venue ${venueId} not found`)
        }
        return venue
    }

    /**
     * @description Maps a stored venue to its public profile, with the URL of its cover
     * @param venue Stored venue
     */
    private toProfile(venue: StoredPublicVenue): StrictOmit<PublicVenue, "upcoming"> {
        const { coverObjectKey, ...rest } = venue
        return {
            ...rest,
            coverPhotoUrl:
                coverObjectKey === null
                    ? null
                    : photoUrl(this.photosPublicBaseUrl, coverObjectKey),
        }
    }
}
