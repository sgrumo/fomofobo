import { and, count, eq, inArray, isNotNull, isNull } from "drizzle-orm"
import type { Category, CategoryUpdate } from "models"

import type { DbInstanceFromSchema } from "../db-config"
import { categories, eventCategories, events, venues } from "../db-schema"

/**
 * @description Maps a `categories` row to its model
 * @param row Row read from `categories`
 */
const toCategory = (row: typeof categories.$inferSelect): Category => ({
    id: row.id,
    name: row.name,
    icon: row.icon,
})

export class CategoriesStorage {
    private readonly db: DbInstanceFromSchema
    public constructor(db: DbInstanceFromSchema) {
        this.db = db
    }

    /**
     * @description Fetches every category, ordered by name
     */
    public async list(): Promise<Category[]> {
        const rows = await this.db.select().from(categories).orderBy(categories.name)
        return rows.map(toCategory)
    }

    /**
     * @description Fetches one category, or `null` when no row matches
     * @param id Category read
     */
    public async findById(id: string): Promise<Category | null> {
        const [row] = await this.db.select().from(categories).where(eq(categories.id, id))
        return row ? toCategory(row) : null
    }

    /**
     * @description Fetches the category with the exact name, or `null` when no row matches
     * @param name Name searched
     */
    public async findByName(name: string): Promise<Category | null> {
        const [row] = await this.db
            .select()
            .from(categories)
            .where(eq(categories.name, name))
        return row ? toCategory(row) : null
    }

    /**
     * @description Persists one category
     * @param category Category inserted, carrying its id
     * @param createdAt Instant of the creation
     */
    public async insert(category: Category, createdAt: Date): Promise<void> {
        await this.db.insert(categories).values({
            id: category.id,
            name: category.name,
            icon: category.icon,
            createdAt,
        })
    }

    /**
     * @description Persists the fields of one category, or returns `null` when no row matches
     * @param id Category changed
     * @param fields Fields replaced
     */
    public async update(id: string, fields: CategoryUpdate): Promise<Category | null> {
        const [row] = await this.db
            .update(categories)
            .set({ name: fields.name, icon: fields.icon })
            .where(eq(categories.id, id))
            .returning()
        return row ? toCategory(row) : null
    }

    /**
     * @description Fetches the count of the events not deleted and of the venues that use the category
     * @param id Category counted
     */
    public async countUses(id: string): Promise<number> {
        const [[eventUses], [venueUses]] = await this.db.batch([
            this.db
                .select({ value: count() })
                .from(eventCategories)
                .innerJoin(events, eq(events.id, eventCategories.eventId))
                .where(and(eq(eventCategories.categoryId, id), isNull(events.deletedAt))),
            this.db
                .select({ value: count() })
                .from(venues)
                .where(eq(venues.categoryId, id)),
        ])
        return (eventUses?.value ?? 0) + (venueUses?.value ?? 0)
    }

    /**
     * @description Deletes one category with its links to deleted events, or returns `null` when no row matches
     * @param id Category deleted
     * @remarks Fails on the foreign key while an event not deleted or a venue uses the category
     */
    public async deleteWithDeletedEventLinks(id: string): Promise<Category | null> {
        const [, [row]] = await this.db.batch([
            this.db
                .delete(eventCategories)
                .where(
                    and(
                        eq(eventCategories.categoryId, id),
                        inArray(
                            eventCategories.eventId,
                            this.db
                                .select({ id: events.id })
                                .from(events)
                                .where(isNotNull(events.deletedAt)),
                        ),
                    ),
                ),
            this.db.delete(categories).where(eq(categories.id, id)).returning(),
        ])
        return row ? toCategory(row) : null
    }
}
