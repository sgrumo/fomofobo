import { and, count, desc, eq, isNull, sql } from "drizzle-orm"
import type { BatchItem } from "drizzle-orm/batch"
import { chunk } from "es-toolkit"
import type { Event, EventListQuery, Recurrence } from "models"
import type { StrictOmit } from "shared/types"

import type { DbInstanceFromSchema } from "../db-config"
import {
    accounts,
    eventCategories,
    eventOccurrences,
    eventPhotos,
    events,
    venues,
} from "../db-schema"
import { likeContains } from "../utils/like"
import { toLimitOffset } from "../utils/pagination"

/**
 * @remarks Fits 100 bound parameters per query at 4 columns per row: change it with the
 * columns of `event_occurrences`
 */
const OCCURRENCE_ROWS_PER_INSERT = 25

export interface StoredEventPhoto {
    id: string
    objectKey: string
    position: number
}

export type StoredEvent = StrictOmit<Event, "photos"> & { photos: StoredEventPhoto[] }

export interface StoredEventListItem {
    id: string
    title: string
    startsAt: string
    endsAt: string
    isRecurring: boolean
    venue: { id: string; name: string }
    organizer: { id: string; name: string }
    isBlocked: boolean
    blockReason: string | null
}

export interface StoredOccurrence {
    localDate: string
    startsAt: Date
    endsAt: Date
}

export interface EventWrite {
    id: string
    organizerId: string
    venueId: string
    title: string
    description: string | null
    startsAt: string
    endsAt: string
    recurrence: Recurrence | null
    instagramUrl: string | null
    facebookUrl: string | null
    price: string | null
    categoryIds: string[]
    primaryCategoryId: string
    photos: StoredEventPhoto[]
    occurrences: StoredOccurrence[]
}

/**
 * @description Maps an event row with its venue, organizer, categories and photos to its record
 * @param row Event row joined with its venue and the name of its organizer
 * @param categoryRows Rows of `event_categories` of the event
 * @param photoRows Rows of `event_photos` of the event, by position
 */
const toStoredEvent = (
    row: {
        event: typeof events.$inferSelect
        venue: typeof venues.$inferSelect
        organizerName: string
    },
    categoryRows: Array<typeof eventCategories.$inferSelect>,
    photoRows: Array<typeof eventPhotos.$inferSelect>,
): StoredEvent => ({
    id: row.event.id,
    title: row.event.title,
    description: row.event.description,
    categoryIds: categoryRows.map(category => category.categoryId),
    primaryCategoryId:
        categoryRows.find(category => category.isPrimary)?.categoryId ?? "",
    venue: {
        id: row.venue.id,
        name: row.venue.name,
        address: row.venue.address,
        coordinates: { latitude: row.venue.latitude, longitude: row.venue.longitude },
    },
    startsAt: row.event.startsAtLocal,
    endsAt: row.event.endsAtLocal,
    recurrence: row.event.recurrence,
    photos: photoRows.map(photo => ({
        id: photo.id,
        objectKey: photo.objectKey,
        position: photo.position,
    })),
    externalLinks: {
        instagramUrl: row.event.instagramUrl,
        facebookUrl: row.event.facebookUrl,
    },
    price: row.event.price,
    organizer: { id: row.event.organizerId, name: row.organizerName },
    isBlocked: row.event.isBlocked,
    blockReason: row.event.blockReason,
    createdAt: row.event.createdAt.toISOString(),
    updatedAt: row.event.updatedAt.toISOString(),
})

export class EventsStorage {
    private readonly db: DbInstanceFromSchema
    public constructor(db: DbInstanceFromSchema) {
        this.db = db
    }

    /**
     * @description Fetches one event not deleted with its children, or `null` when no row matches
     * @param id Event read
     */
    public async findById(id: string): Promise<StoredEvent | null> {
        // Outside the batch: a batch maps joined rows by column name, and the joined
        // tables share `id`, `name` and the timestamps
        const [row] = await this.db
            .select({ event: events, venue: venues, organizerName: accounts.name })
            .from(events)
            .innerJoin(venues, eq(venues.id, events.venueId))
            .innerJoin(accounts, eq(accounts.id, events.organizerId))
            .where(and(eq(events.id, id), isNull(events.deletedAt)))
        if (row === undefined) {
            return null
        }
        const [categoryRows, photoRows] = await this.db.batch([
            this.db.select().from(eventCategories).where(eq(eventCategories.eventId, id)),
            this.db
                .select()
                .from(eventPhotos)
                .where(eq(eventPhotos.eventId, id))
                .orderBy(eventPhotos.position),
        ])
        return toStoredEvent(row, categoryRows, photoRows)
    }

    /**
     * @description Fetches one page of the events not deleted, latest start first, with the total
     * @param query Page, text searched in the title, organizer, block state
     */
    public async list(
        query: EventListQuery,
    ): Promise<{ items: StoredEventListItem[]; total: number }> {
        const whereClause = and(
            isNull(events.deletedAt),
            query.q === undefined ? undefined : likeContains(events.title, query.q),
            query.organizerId === undefined
                ? undefined
                : eq(events.organizerId, query.organizerId),
            query.isBlocked === undefined
                ? undefined
                : eq(events.isBlocked, query.isBlocked),
        )
        const { limit, offset } = toLimitOffset(query)

        const [countResult, rows] = await this.db.batch([
            this.db.select({ value: count() }).from(events).where(whereClause),
            this.db
                .select({
                    event: events,
                    // Aliased: a batch maps joined rows by column name
                    venueName: sql<string>`${venues.name}`.as("venue_name"),
                    organizerName: sql<string>`${accounts.name}`.as("organizer_name"),
                })
                .from(events)
                .innerJoin(venues, eq(venues.id, events.venueId))
                .innerJoin(accounts, eq(accounts.id, events.organizerId))
                .where(whereClause)
                .orderBy(desc(events.startsAtLocal), events.id)
                .limit(limit)
                .offset(offset),
        ])
        return {
            items: rows.map(row => ({
                id: row.event.id,
                title: row.event.title,
                startsAt: row.event.startsAtLocal,
                endsAt: row.event.endsAtLocal,
                isRecurring: row.event.recurrence !== null,
                venue: { id: row.event.venueId, name: row.venueName },
                organizer: { id: row.event.organizerId, name: row.organizerName },
                isBlocked: row.event.isBlocked,
                blockReason: row.event.blockReason,
            })),
            total: countResult[0]?.value ?? 0,
        }
    }

    /**
     * @description Persists one event with its categories, photos and occurrences
     * @param event Event inserted, carrying its id and every child row
     * @param at Instant of the creation
     */
    public async insertWithChildren(event: EventWrite, at: Date): Promise<void> {
        await this.db.batch([
            this.db.insert(events).values({
                id: event.id,
                organizerId: event.organizerId,
                venueId: event.venueId,
                title: event.title,
                description: event.description,
                startsAtLocal: event.startsAt,
                endsAtLocal: event.endsAt,
                recurrence: event.recurrence,
                instagramUrl: event.instagramUrl,
                facebookUrl: event.facebookUrl,
                price: event.price,
                createdAt: at,
                updatedAt: at,
            }),
            ...this.childInserts(event, at),
        ])
    }

    /**
     * @description Persists the fields of one event and replaces its categories, photos and occurrences
     * @param event Event written, carrying every child row
     * @param at Instant of the change
     * @remarks Replaces the children of a deleted event too: read the event first
     */
    public async updateWithChildren(event: EventWrite, at: Date): Promise<void> {
        await this.db.batch([
            this.db
                .update(events)
                .set({
                    organizerId: event.organizerId,
                    venueId: event.venueId,
                    title: event.title,
                    description: event.description,
                    startsAtLocal: event.startsAt,
                    endsAtLocal: event.endsAt,
                    recurrence: event.recurrence,
                    instagramUrl: event.instagramUrl,
                    facebookUrl: event.facebookUrl,
                    price: event.price,
                    updatedAt: at,
                })
                .where(and(eq(events.id, event.id), isNull(events.deletedAt))),
            this.db.delete(eventCategories).where(eq(eventCategories.eventId, event.id)),
            this.db.delete(eventPhotos).where(eq(eventPhotos.eventId, event.id)),
            this.db
                .delete(eventOccurrences)
                .where(eq(eventOccurrences.eventId, event.id)),
            ...this.childInserts(event, at),
        ])
    }

    /**
     * @description Persists the deletion of one event, or returns `false` when no event not deleted matches
     * @param id Event deleted
     * @param at Instant of the deletion
     */
    public async softDelete(id: string, at: Date): Promise<boolean> {
        const rows = await this.db
            .update(events)
            .set({ deletedAt: at })
            .where(and(eq(events.id, id), isNull(events.deletedAt)))
            .returning({ id: events.id })
        return rows.length > 0
    }

    /**
     * @description Persists the block state of one event, or returns `false` when no event not deleted matches
     * @param id Event changed
     * @param block Block state and its reason, `null` reason when unblocked
     * @param at Instant of the change
     */
    public async setBlocked(
        id: string,
        block: { isBlocked: boolean; blockReason: string | null },
        at: Date,
    ): Promise<boolean> {
        const rows = await this.db
            .update(events)
            .set({
                isBlocked: block.isBlocked,
                blockReason: block.blockReason,
                updatedAt: at,
            })
            .where(and(eq(events.id, id), isNull(events.deletedAt)))
            .returning({ id: events.id })
        return rows.length > 0
    }

    /**
     * @description Builds the inserts of the categories, photos and occurrences of one event
     * @param event Event whose children are inserted
     * @param at Instant of the write
     */
    private childInserts(event: EventWrite, at: Date): Array<BatchItem<"sqlite">> {
        return [
            this.db.insert(eventCategories).values(
                event.categoryIds.map(categoryId => ({
                    eventId: event.id,
                    categoryId,
                    isPrimary: categoryId === event.primaryCategoryId,
                })),
            ),
            ...(event.photos.length === 0
                ? []
                : [
                      this.db.insert(eventPhotos).values(
                          event.photos.map(photo => ({
                              id: photo.id,
                              eventId: event.id,
                              objectKey: photo.objectKey,
                              position: photo.position,
                              createdAt: at,
                          })),
                      ),
                  ]),
            ...chunk(event.occurrences, OCCURRENCE_ROWS_PER_INSERT).map(rows =>
                this.db.insert(eventOccurrences).values(
                    rows.map(occurrence => ({
                        eventId: event.id,
                        localDate: occurrence.localDate,
                        startsAt: occurrence.startsAt,
                        endsAt: occurrence.endsAt,
                    })),
                ),
            ),
        ]
    }
}
