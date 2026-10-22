import { and, count, eq, isNull, or } from "drizzle-orm"
import type {
    Venue,
    VenueCreation,
    VenueKindChange,
    VenueListQuery,
    VenueUpdate,
} from "models"
import type { StrictOmit } from "shared/types"

import type { DbInstanceFromSchema } from "../db-config"
import { accounts, venues } from "../db-schema"
import { likeContains } from "../utils/like"
import { toLimitOffset } from "../utils/pagination"

export type StoredVenue = StrictOmit<Venue, "coverPhotoUrl"> & {
    coverObjectKey: string | null
}

export type VenueWrite = StrictOmit<VenueUpdate, "coverPhotoKey"> & {
    coverObjectKey?: string | null
}

/**
 * @description Maps a `venues` row joined with the name of its owner to its record
 * @param row Venue row and the owner name, `null` when the venue has no owner
 */
const toStoredVenue = (row: {
    venue: typeof venues.$inferSelect
    ownerName: string | null
}): StoredVenue => ({
    id: row.venue.id,
    name: row.venue.name,
    address: row.venue.address,
    coordinates: { latitude: row.venue.latitude, longitude: row.venue.longitude },
    description: row.venue.description,
    coverObjectKey: row.venue.coverObjectKey,
    links: {
        websiteUrl: row.venue.websiteUrl,
        instagramUrl: row.venue.instagramUrl,
        facebookUrl: row.venue.facebookUrl,
    },
    kind: row.venue.kind,
    programmeUrl: row.venue.programmeUrl,
    categoryId: row.venue.categoryId,
    owner:
        row.venue.ownerId === null || row.ownerName === null
            ? null
            : { id: row.venue.ownerId, name: row.ownerName },
    isBlocked: row.venue.isBlocked,
    blockReason: row.venue.blockReason,
})

export class VenuesStorage {
    private readonly db: DbInstanceFromSchema
    public constructor(db: DbInstanceFromSchema) {
        this.db = db
    }

    /**
     * @description Fetches one page of the venues with their owner, ordered by name, with the total
     * @param query Page, text searched in name and address, and blocked state
     */
    public async list(
        query: VenueListQuery,
    ): Promise<{ items: StoredVenue[]; total: number }> {
        const whereClause = and(
            query.q === undefined
                ? undefined
                : or(
                      likeContains(venues.name, query.q),
                      likeContains(venues.address, query.q),
                  ),
            query.isBlocked === undefined
                ? undefined
                : eq(venues.isBlocked, query.isBlocked),
        )
        const { limit, offset } = toLimitOffset(query)

        const [countResult, rows] = await this.db.batch([
            this.db.select({ value: count() }).from(venues).where(whereClause),
            this.db
                .select({ venue: venues, ownerName: accounts.name })
                .from(venues)
                .leftJoin(accounts, eq(accounts.id, venues.ownerId))
                .where(whereClause)
                .orderBy(venues.name, venues.id)
                .limit(limit)
                .offset(offset),
        ])
        return { items: rows.map(toStoredVenue), total: countResult[0]?.value ?? 0 }
    }

    /**
     * @description Fetches one venue with its owner, or `null` when no row matches
     * @param id Venue read
     */
    public async findById(id: string): Promise<StoredVenue | null> {
        const [row] = await this.db
            .select({ venue: venues, ownerName: accounts.name })
            .from(venues)
            .leftJoin(accounts, eq(accounts.id, venues.ownerId))
            .where(eq(venues.id, id))
        return row ? toStoredVenue(row) : null
    }

    /**
     * @description Fetches the id of the venue an account owns, or `null` when it owns none
     * @param accountId Owner searched
     */
    public async findOwnedBy(accountId: string): Promise<string | null> {
        const [row] = await this.db
            .select({ id: venues.id })
            .from(venues)
            .where(eq(venues.ownerId, accountId))
        return row?.id ?? null
    }

    /**
     * @description Persists one venue, and returns false when its owner already owns one
     * @param venue Venue inserted, carrying its id
     * @param people Account that creates it, and its owner, `null` for no owner
     * @param createdAt Instant of the creation
     */
    public async insert(
        venue: VenueCreation & { id: string },
        people: { createdBy: string; ownerId: string | null },
        createdAt: Date,
    ): Promise<boolean> {
        const rows = await this.db
            .insert(venues)
            .values({
                id: venue.id,
                name: venue.name,
                address: venue.address,
                latitude: venue.coordinates.latitude,
                longitude: venue.coordinates.longitude,
                createdBy: people.createdBy,
                ownerId: people.ownerId,
                createdAt,
                updatedAt: createdAt,
            })
            .onConflictDoNothing()
            .returning({ id: venues.id })
        return rows.length > 0
    }

    /**
     * @description Persists the fields of one venue, and returns false when no row matches
     * @param id Venue changed
     * @param fields Fields replaced
     * @param updatedAt Instant of the change
     * @param ownerId Owner the row must have, for a write by its Organizer
     */
    public async update(
        id: string,
        fields: VenueWrite,
        updatedAt: Date,
        ownerId?: string,
    ): Promise<boolean> {
        const rows = await this.db
            .update(venues)
            .set({
                name: fields.name,
                address: fields.address,
                latitude: fields.coordinates?.latitude,
                longitude: fields.coordinates?.longitude,
                description: fields.description,
                coverObjectKey: fields.coverObjectKey,
                websiteUrl: fields.links?.websiteUrl,
                instagramUrl: fields.links?.instagramUrl,
                facebookUrl: fields.links?.facebookUrl,
                updatedAt,
            })
            .where(
                and(
                    eq(venues.id, id),
                    ownerId === undefined ? undefined : eq(venues.ownerId, ownerId),
                ),
            )
            .returning({ id: venues.id })
        return rows.length > 0
    }

    /**
     * @description Persists the owner of one venue, and returns false when no row matches or an owner meets a permanent venue
     * @param id Venue changed
     * @param ownerId New owner, `null` for no owner
     * @param updatedAt Instant of the change
     * @remarks Fails on the unique owner index when the owner already owns another venue
     */
    public async setOwner(
        id: string,
        ownerId: string | null,
        updatedAt: Date,
    ): Promise<boolean> {
        const rows = await this.db
            .update(venues)
            .set({ ownerId, updatedAt })
            .where(
                and(
                    eq(venues.id, id),
                    ownerId === null ? undefined : eq(venues.kind, "regular"),
                ),
            )
            .returning({ id: venues.id })
        return rows.length > 0
    }

    /**
     * @description Persists the kind of one venue, and returns false when no row matches or a permanent kind meets an owner
     * @param id Venue changed
     * @param change Kind, with the programme link and the category of a permanent kind
     * @param updatedAt Instant of the change
     */
    public async setKind(
        id: string,
        change: VenueKindChange,
        updatedAt: Date,
    ): Promise<boolean> {
        const rows = await this.db
            .update(venues)
            .set({
                kind: change.kind,
                programmeUrl: change.kind === "regular" ? null : change.programmeUrl,
                categoryId: change.kind === "regular" ? null : change.categoryId,
                updatedAt,
            })
            .where(
                and(
                    eq(venues.id, id),
                    change.kind === "regular" ? undefined : isNull(venues.ownerId),
                ),
            )
            .returning({ id: venues.id })
        return rows.length > 0
    }

    /**
     * @description Persists the blocked state of one venue, and returns false when no row matches
     * @param id Venue changed
     * @param block Blocked state and the reason, `null` on an unblock
     * @param updatedAt Instant of the change
     */
    public async setBlocked(
        id: string,
        block: { isBlocked: boolean; blockReason: string | null },
        updatedAt: Date,
    ): Promise<boolean> {
        const rows = await this.db
            .update(venues)
            .set({
                isBlocked: block.isBlocked,
                blockReason: block.blockReason,
                updatedAt,
            })
            .where(eq(venues.id, id))
            .returning({ id: venues.id })
        return rows.length > 0
    }
}
