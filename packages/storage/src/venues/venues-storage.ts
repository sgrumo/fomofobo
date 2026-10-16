import { count, eq, or } from "drizzle-orm"
import type { Venue, VenueListQuery, VenueUpdate } from "models"

import type { DbInstanceFromSchema } from "../db-config"
import { venues } from "../db-schema"
import { likeContains } from "../utils/like"
import { toLimitOffset } from "../utils/pagination"

/**
 * @description Maps a `venues` row to its model
 * @param row Row read from `venues`
 */
const toVenue = (row: typeof venues.$inferSelect): Venue => ({
    id: row.id,
    name: row.name,
    address: row.address,
    coordinates: { latitude: row.latitude, longitude: row.longitude },
})

export class VenuesStorage {
    private readonly db: DbInstanceFromSchema
    public constructor(db: DbInstanceFromSchema) {
        this.db = db
    }

    /**
     * @description Fetches one page of the venues, ordered by name, with the total
     * @param query Page and text searched in name and address
     */
    public async list(query: VenueListQuery): Promise<{ items: Venue[]; total: number }> {
        const whereClause =
            query.q === undefined
                ? undefined
                : or(
                      likeContains(venues.name, query.q),
                      likeContains(venues.address, query.q),
                  )
        const { limit, offset } = toLimitOffset(query)

        const [countResult, rows] = await this.db.batch([
            this.db.select({ value: count() }).from(venues).where(whereClause),
            this.db
                .select()
                .from(venues)
                .where(whereClause)
                .orderBy(venues.name, venues.id)
                .limit(limit)
                .offset(offset),
        ])
        return { items: rows.map(toVenue), total: countResult[0]?.value ?? 0 }
    }

    /**
     * @description Fetches one venue, or `null` when no row matches
     * @param id Venue read
     */
    public async findById(id: string): Promise<Venue | null> {
        const [row] = await this.db.select().from(venues).where(eq(venues.id, id))
        return row ? toVenue(row) : null
    }

    /**
     * @description Persists one venue
     * @param venue Venue inserted, carrying its id
     * @param createdBy Account that creates it
     * @param createdAt Instant of the creation
     */
    public async insert(venue: Venue, createdBy: string, createdAt: Date): Promise<void> {
        await this.db.insert(venues).values({
            id: venue.id,
            name: venue.name,
            address: venue.address,
            latitude: venue.coordinates.latitude,
            longitude: venue.coordinates.longitude,
            createdBy,
            createdAt,
            updatedAt: createdAt,
        })
    }

    /**
     * @description Persists the fields of one venue, or returns `null` when no row matches
     * @param id Venue changed
     * @param fields Fields replaced
     * @param updatedAt Instant of the change
     */
    public async update(
        id: string,
        fields: VenueUpdate,
        updatedAt: Date,
    ): Promise<Venue | null> {
        const [row] = await this.db
            .update(venues)
            .set({
                name: fields.name,
                address: fields.address,
                latitude: fields.coordinates?.latitude,
                longitude: fields.coordinates?.longitude,
                updatedAt,
            })
            .where(eq(venues.id, id))
            .returning()
        return row ? toVenue(row) : null
    }
}
