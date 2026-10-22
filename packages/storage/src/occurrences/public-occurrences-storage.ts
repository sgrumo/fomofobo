import type { SQL } from "drizzle-orm"
import { and, count, desc, eq, gt, inArray, isNull, lt, or, sql } from "drizzle-orm"
import type {
    GeoPoint,
    OccurrenceRef,
    PublicVenue,
    VenueHistoryItem,
    VenueHistoryQuery,
} from "models"
import type { StrictOmit } from "shared/types"

import type { DbInstanceFromSchema, DbSelect } from "../db-config"
import {
    accounts,
    eventCategories,
    eventOccurrences,
    eventPhotos,
    events,
    venues,
} from "../db-schema"
import type { StoredEventPhoto } from "../events/events-storage"
import { likeContains } from "../utils/like"
import { toLimitOffset } from "../utils/pagination"

const EARTH_RADIUS_METERS = 6_371_000

export interface PublicOccurrenceSearch {
    window: { from: Date; to: Date }
    center: GeoPoint
    radiusMeters: number
    box: {
        minLatitude: number
        maxLatitude: number
        minLongitude: number
        maxLongitude: number
    }
    q?: string
    categoryIds?: string[]
    now: Date
    limit: number
    // PLACEHOLDER(OP-17)
    onePerEvent: boolean
}

export interface StoredOccurrenceSummary {
    eventId: string
    localDate: string
    startsAt: Date
    endsAt: Date
    title: string
    description: string | null
    venue: { id: string; name: string; coordinates: GeoPoint; isBlocked: boolean }
    categoryIds: string[]
    primaryCategoryId: string
    coverObjectKey: string | null
    price: string | null
}

export type StoredPublicVenue = StrictOmit<PublicVenue, "coverPhotoUrl" | "upcoming"> & {
    coverObjectKey: string | null
}

export interface StoredOccurrenceDetail extends StoredOccurrenceSummary {
    venueAddress: string
    photos: StoredEventPhoto[]
    externalLinks: { instagramUrl: string | null; facebookUrl: string | null }
}

/** @remarks Needs a join on `accounts` in each query that uses it */
const visibleEvent = and(
    sql`${events.isBlocked} = 0`,
    isNull(events.deletedAt),
    sql`${accounts.isBlocked} = 0`,
)

/**
 * @description Builds the great-circle distance in meters from a point to the venue
 * @param center Point measured from
 */
const distanceFrom = (center: GeoPoint): SQL<number> =>
    sql<number>`${EARTH_RADIUS_METERS} * acos(min(1, cos(radians(${center.latitude})) * cos(radians(${venues.latitude})) * cos(radians(${venues.longitude}) - radians(${center.longitude})) + sin(radians(${center.latitude})) * sin(radians(${venues.latitude}))))`

/**
 * @description Builds the condition of a venue inside the box and within the radius of the center
 * @param area Center, radius and the box that holds the circle
 */
const insideArea = (
    area: Pick<PublicOccurrenceSearch, "center" | "radiusMeters" | "box">,
): SQL | undefined =>
    and(
        sql`${venues.latitude} between ${area.box.minLatitude} and ${area.box.maxLatitude}`,
        sql`${venues.longitude} between ${area.box.minLongitude} and ${area.box.maxLongitude}`,
        sql`${distanceFrom(area.center)} <= ${area.radiusMeters}`,
    )

const summaryColumns = {
    eventId: eventOccurrences.eventId,
    localDate: eventOccurrences.localDate,
    startsAt: eventOccurrences.startsAt,
    endsAt: eventOccurrences.endsAt,
    title: events.title,
    description: events.description,
    price: events.price,
    venueId: venues.id,
    venueName: venues.name,
    venueIsBlocked: venues.isBlocked,
    latitude: venues.latitude,
    longitude: venues.longitude,
    // UUIDs hold no comma, so the list splits back without loss
    categoryIds: sql<string>`(select group_concat(${eventCategories.categoryId}) from ${eventCategories} where ${eventCategories.eventId} = ${events.id})`,
    primaryCategoryId: sql<string>`(select ${eventCategories.categoryId} from ${eventCategories} where ${eventCategories.eventId} = ${events.id} and ${eventCategories.isPrimary} = 1)`,
    coverObjectKey: sql<
        string | null
    >`(select ${eventPhotos.objectKey} from ${eventPhotos} where ${eventPhotos.eventId} = ${events.id} order by ${eventPhotos.position} limit 1)`,
}

/**
 * @description Builds the select of the occurrences with their event, venue and organizer
 * @param db Database the query runs on
 */
const selectSummaryRows = (db: DbSelect) =>
    db
        .select(summaryColumns)
        .from(eventOccurrences)
        .innerJoin(events, eq(events.id, eventOccurrences.eventId))
        .innerJoin(venues, eq(venues.id, events.venueId))
        .innerJoin(accounts, eq(accounts.id, events.organizerId))

type SummaryRow = Awaited<ReturnType<typeof selectSummaryRows>>[number]

/**
 * @description Maps a row of `selectSummaryRows` to its record
 * @param row Occurrence row with its event and venue columns
 */
const toSummary = (row: SummaryRow): StoredOccurrenceSummary => ({
    eventId: row.eventId,
    localDate: row.localDate,
    startsAt: row.startsAt,
    endsAt: row.endsAt,
    title: row.title,
    description: row.description,
    venue: {
        id: row.venueId,
        name: row.venueName,
        coordinates: { latitude: row.latitude, longitude: row.longitude },
        isBlocked: row.venueIsBlocked,
    },
    categoryIds: row.categoryIds.split(","),
    primaryCategoryId: row.primaryCategoryId,
    coverObjectKey: row.coverObjectKey,
    price: row.price,
})

/**
 * @description Builds the condition of one occurrence ref, which matches a single event on any date
 * @param ref Event and local start date of the occurrence
 */
const matchesRef = (ref: OccurrenceRef): SQL | undefined =>
    and(
        eq(eventOccurrences.eventId, ref.eventId),
        or(eq(eventOccurrences.localDate, ref.date), isNull(events.recurrence)),
    )

export class PublicOccurrencesStorage {
    private readonly db: DbInstanceFromSchema
    public constructor(db: DbInstanceFromSchema) {
        this.db = db
    }

    /**
     * @description Fetches the visible occurrences of an area and a window, live first, with the counts per category
     * @param search Window, area, filters, clock and cap of the search
     * @remarks Counts the events of each category under every filter but the category one
     */
    public async search(search: PublicOccurrenceSearch): Promise<{
        occurrences: StoredOccurrenceSummary[]
        categoryCounts: Array<{ categoryId: string; count: number }>
        truncated: boolean
    }> {
        const now = search.now.getTime()
        const baseFilter = and(
            visibleEvent,
            // PLACEHOLDER(OP-08): overlap with the window
            gt(eventOccurrences.endsAt, search.window.from),
            lt(eventOccurrences.startsAt, search.window.to),
            insideArea(search),
            search.q === undefined ? undefined : likeContains(events.title, search.q),
        )
        const firstInWindow = search.onePerEvent
            ? sql`${eventOccurrences.startsAt} = (select min(inner_occurrence.starts_at) from ${eventOccurrences} as inner_occurrence where inner_occurrence.event_id = ${eventOccurrences.eventId} and inner_occurrence.ends_at > ${search.window.from.getTime()} and inner_occurrence.starts_at < ${search.window.to.getTime()})`
            : undefined
        const categoryFilter =
            search.categoryIds === undefined
                ? undefined
                : inArray(
                      events.id,
                      this.db
                          .select({ eventId: eventCategories.eventId })
                          .from(eventCategories)
                          .where(inArray(eventCategories.categoryId, search.categoryIds)),
                  )

        const [rows, counts] = await this.db.batch([
            selectSummaryRows(this.db)
                .where(and(baseFilter, firstInWindow, categoryFilter))
                .orderBy(
                    sql`case when ${eventOccurrences.endsAt} <= ${now} then 2 when ${eventOccurrences.startsAt} <= ${now} then 0 else 1 end`,
                    eventOccurrences.startsAt,
                    eventOccurrences.eventId,
                )
                .limit(search.limit + 1),
            this.db
                .select({
                    categoryId: eventCategories.categoryId,
                    count: sql<number>`count(distinct ${events.id})`,
                })
                .from(eventOccurrences)
                .innerJoin(events, eq(events.id, eventOccurrences.eventId))
                .innerJoin(venues, eq(venues.id, events.venueId))
                .innerJoin(accounts, eq(accounts.id, events.organizerId))
                .innerJoin(eventCategories, eq(eventCategories.eventId, events.id))
                .where(baseFilter)
                .groupBy(eventCategories.categoryId),
        ])
        return {
            occurrences: rows.slice(0, search.limit).map(toSummary),
            categoryCounts: counts,
            truncated: rows.length > search.limit,
        }
    }

    /**
     * @description Fetches one visible occurrence with its photos and links, or `null` when no row matches
     * @param ref Event and local start date of the occurrence
     * @remarks Ignores the date of a ref to a single event
     */
    public async findDetail(ref: OccurrenceRef): Promise<StoredOccurrenceDetail | null> {
        const [rows, photoRows] = await this.db.batch([
            this.db
                .select({
                    ...summaryColumns,
                    venueAddress: venues.address,
                    instagramUrl: events.instagramUrl,
                    facebookUrl: events.facebookUrl,
                })
                .from(eventOccurrences)
                .innerJoin(events, eq(events.id, eventOccurrences.eventId))
                .innerJoin(venues, eq(venues.id, events.venueId))
                .innerJoin(accounts, eq(accounts.id, events.organizerId))
                .where(and(visibleEvent, matchesRef(ref))),
            this.db
                .select()
                .from(eventPhotos)
                .where(eq(eventPhotos.eventId, ref.eventId))
                .orderBy(eventPhotos.position),
        ])
        const [row] = rows
        return row
            ? {
                  ...toSummary(row),
                  venueAddress: row.venueAddress,
                  photos: photoRows.map(photo => ({
                      id: photo.id,
                      objectKey: photo.objectKey,
                      position: photo.position,
                  })),
                  externalLinks: {
                      instagramUrl: row.instagramUrl,
                      facebookUrl: row.facebookUrl,
                  },
              }
            : null
    }

    /**
     * @description Fetches the visible occurrences of the refs that end after an instant, in ref order
     * @param refs Event and local start date of each occurrence
     * @param endedAfter Instant each occurrence ends after
     * @remarks Ignores the date of a ref to a single event
     */
    public async lookup(
        refs: OccurrenceRef[],
        endedAfter: Date,
    ): Promise<StoredOccurrenceSummary[]> {
        const [first, ...rest] = refs.map(ref =>
            selectSummaryRows(this.db)
                .where(
                    and(
                        visibleEvent,
                        matchesRef(ref),
                        gt(eventOccurrences.endsAt, endedAfter),
                    ),
                )
                .limit(1),
        )
        if (first === undefined) {
            return []
        }
        const results = await this.db.batch([first, ...rest])
        return results.flatMap(rows => rows.map(toSummary))
    }

    /**
     * @description Fetches the visible events of the area whose title matches, each with its next occurrence that has not ended, soonest first
     * @param search Text, area, clock and cap of the suggestions
     */
    public async suggestEvents(
        search: Pick<
            PublicOccurrenceSearch,
            "center" | "radiusMeters" | "box" | "now" | "limit"
        > & {
            q: string
        },
    ): Promise<Array<{ eventId: string; localDate: string; title: string }>> {
        const now = search.now.getTime()
        return await this.db
            .select({
                eventId: eventOccurrences.eventId,
                localDate: eventOccurrences.localDate,
                title: events.title,
            })
            .from(eventOccurrences)
            .innerJoin(events, eq(events.id, eventOccurrences.eventId))
            .innerJoin(venues, eq(venues.id, events.venueId))
            .innerJoin(accounts, eq(accounts.id, events.organizerId))
            .where(
                and(
                    visibleEvent,
                    insideArea(search),
                    likeContains(events.title, search.q),
                    sql`${eventOccurrences.startsAt} = (select min(next_occurrence.starts_at) from ${eventOccurrences} as next_occurrence where next_occurrence.event_id = ${eventOccurrences.eventId} and next_occurrence.ends_at > ${now})`,
                ),
            )
            .orderBy(eventOccurrences.startsAt, eventOccurrences.eventId)
            .limit(search.limit)
    }

    /**
     * @description Fetches the profile of a venue that is not blocked, or `null` when none matches
     * @param id Venue read
     */
    public async findPublicVenue(id: string): Promise<StoredPublicVenue | null> {
        const [row] = await this.db
            .select()
            .from(venues)
            .where(and(eq(venues.id, id), sql`${venues.isBlocked} = 0`))
        return row
            ? {
                  id: row.id,
                  name: row.name,
                  address: row.address,
                  coordinates: { latitude: row.latitude, longitude: row.longitude },
                  description: row.description,
                  coverObjectKey: row.coverObjectKey,
                  links: {
                      websiteUrl: row.websiteUrl,
                      instagramUrl: row.instagramUrl,
                      facebookUrl: row.facebookUrl,
                  },
              }
            : null
    }

    /**
     * @description Fetches the visible events of a venue that have an occurrence not yet ended, each with that next occurrence, live first, then soonest
     * @param venueId Venue whose events are read
     * @param now Instant that sets the status order and the occurrences ended
     * @param limit Cap of the events read
     */
    public async listVenueUpcoming(
        venueId: string,
        now: Date,
        limit: number,
    ): Promise<StoredOccurrenceSummary[]> {
        const at = now.getTime()
        const rows = await selectSummaryRows(this.db)
            .where(
                and(
                    visibleEvent,
                    eq(events.venueId, venueId),
                    sql`${eventOccurrences.startsAt} = (select min(next_occurrence.starts_at) from ${eventOccurrences} as next_occurrence where next_occurrence.event_id = ${eventOccurrences.eventId} and next_occurrence.ends_at > ${at})`,
                ),
            )
            .orderBy(
                sql`case when ${eventOccurrences.startsAt} <= ${at} then 0 else 1 end`,
                eventOccurrences.startsAt,
                eventOccurrences.eventId,
            )
            .limit(limit)
        return rows.map(toSummary)
    }

    /**
     * @description Fetches one page of the visible events of a venue whose last occurrence ended, newest end first, with the total
     * @param venueId Venue whose events are read
     * @param now Instant every occurrence of a past event ends at or before
     * @param query Page of the history
     */
    public async listVenueHistory(
        venueId: string,
        now: Date,
        query: VenueHistoryQuery,
    ): Promise<{ items: VenueHistoryItem[]; total: number }> {
        const lastEndsAt = sql<number>`max(${eventOccurrences.endsAt})`
        const pastEvents = this.db
            .select({
                eventId: events.id,
                title: events.title,
                categoryIds:
                    sql<string>`(select group_concat(${eventCategories.categoryId}) from ${eventCategories} where ${eventCategories.eventId} = ${events.id})`.as(
                        "category_ids",
                    ),
                firstDate: sql<string>`min(${eventOccurrences.localDate})`.as(
                    "first_date",
                ),
                lastDate: sql<string>`max(${eventOccurrences.localDate})`.as("last_date"),
                lastEndsAt: lastEndsAt.as("last_ends_at"),
            })
            .from(events)
            .innerJoin(eventOccurrences, eq(eventOccurrences.eventId, events.id))
            .innerJoin(accounts, eq(accounts.id, events.organizerId))
            .where(and(visibleEvent, eq(events.venueId, venueId)))
            .groupBy(events.id)
            .having(sql`${lastEndsAt} <= ${now.getTime()}`)
            .as("past_events")
        const { limit, offset } = toLimitOffset(query)

        const [countResult, rows] = await this.db.batch([
            this.db.select({ value: count() }).from(pastEvents),
            this.db
                .select()
                .from(pastEvents)
                .orderBy(desc(pastEvents.lastEndsAt), pastEvents.eventId)
                .limit(limit)
                .offset(offset),
        ])
        return {
            items: rows.map(row => ({
                eventId: row.eventId,
                title: row.title,
                categoryIds: row.categoryIds.split(","),
                firstDate: row.firstDate,
                lastDate: row.lastDate,
            })),
            total: countResult[0]?.value ?? 0,
        }
    }

    /**
     * @description Fetches the venues of the area that are not blocked and whose name matches, ordered by name
     * @param search Text, area and cap of the suggestions
     */
    public async suggestVenues(
        search: Pick<
            PublicOccurrenceSearch,
            "center" | "radiusMeters" | "box" | "limit"
        > & {
            q: string
        },
    ): Promise<Array<{ venueId: string; name: string; address: string }>> {
        return await this.db
            .select({ venueId: venues.id, name: venues.name, address: venues.address })
            .from(venues)
            .where(
                and(
                    sql`${venues.isBlocked} = 0`,
                    insideArea(search),
                    likeContains(venues.name, search.q),
                ),
            )
            .orderBy(venues.name, venues.id)
            .limit(search.limit)
    }
}
