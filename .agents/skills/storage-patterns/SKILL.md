---
name: storage-patterns
description: "Drizzle query patterns for the storage package: filters, search, pagination, inserts, updates, deletes, transactions. Also the table, enum, and storage class conventions. Use when you write or change a query, a storage method, or a table."
user-invocable: true
---

## Storage patterns

$ARGUMENTS

The storage package (`packages/storage/`) is a thin DB access layer on Drizzle. A storage class runs queries, inserts, updates, and deletes. It contains no business logic. Validation, orchestration, id generation, and domain rules live in the service. A storage method can still run several writes that always go together. See [Transactions](#transactions). Logic that is part of one complex query (an aggregation, a join) can stay in storage.

The reference implementation is `packages/storage/src/todo/todo-storage.ts`. If this file and that code disagree, read the code and report the drift.

| Task                                       | Section                           |
| ------------------------------------------ | --------------------------------- |
| Add or change a column                     | [Tables](#tables)                 |
| Add a DB enum                              | [Enums](#enums)                   |
| Add a storage class                        | [Storage class](#storage-class)   |
| Write a filter, a search, or a page        | [Reads](#reads)                   |
| Write an insert, an update, or a delete    | [Writes](#writes)                 |
| Write two or more rows together            | [Transactions](#transactions)     |
| Add a table, or change one that holds rows | [Schema changes](#schema-changes) |

### Tables

All tables live in `packages/storage/src/db-schema.ts`.

```typescript
import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"

export const items = pgTable("items", {
    id: uuid("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    isActive: boolean("is_active").notNull().default(true),
    ownerId: uuid("owner_id").references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})
```

- Use `text()` for text columns. Never use `varchar()`.
- Write DB column names in snake_case and TS fields in camelCase.
- Make the primary key `uuid("id").primaryKey()`.
- Write `.notNull()` on each required column. A column without it is nullable.
- Write a foreign key as `uuid("other_id").references(() => other.id)`.
- Give a `timestamp` column `{ withTimezone: true }`.
- Give a `date` column `{ mode: "string" }` when the model holds an ISO date string.

### Enums

A DB enum takes its values from one `as const` array in the model file. The root `AGENTS.md` holds the naming rules for enum values and `pgEnum` type names.

```typescript
// packages/models/src/items.ts
export const itemStatusValues = ["draft", "active", "archived"] as const
export const itemStatusSchema = z.enum(itemStatusValues)
export type ItemStatus = z.infer<typeof itemStatusSchema>
```

```typescript
// packages/storage/src/db-schema.ts
import { itemStatusValues } from "models"

export const itemStatusEnum = pgEnum("item_status", itemStatusValues)

export const items = pgTable("items", {
    status: itemStatusEnum("status").notNull(),
})
```

- Each DB enum exports three things from models: `xxxValues`, `xxxSchema`, and `type Xxx`.
- Never copy the values into storage. Import the `xxxValues` array.
- If an enum never reaches the DB, use a plain `z.enum([...])` without a `xxxValues` array.

### Storage class

Each domain has one class in `packages/storage/src/<domain>/<domain>-storage.ts`.

```typescript
import { eq } from "drizzle-orm"
import type { Item } from "models"

import type { DbInstanceFromSchema } from "../db-config"
import { items } from "../db-schema"

/**
 * @description Maps an `items` row to its model
 * @param row Row read from `items`
 */
const toItem = (row: typeof items.$inferSelect): Item => ({
    id: row.id,
    name: row.name,
    isActive: row.isActive,
})

export class ItemStorage {
    private readonly db: DbInstanceFromSchema
    public constructor(db: DbInstanceFromSchema) {
        this.db = db
    }

    /**
     * @description Fetches one item, or `null` when no row matches
     * @param id Item read
     */
    public async getItem(id: string): Promise<Item | null> {
        const [row] = await this.db.select().from(items).where(eq(items.id, id))
        return row ? toItem(row) : null
    }
}
```

- Export the class from `packages/storage/src/index.ts`.
- The class is concrete. The constructor takes `DbInstanceFromSchema`.
- Write one `toXxx` mapper per table, typed on `typeof table.$inferSelect`. Each method that returns rows uses it.
- If a method targets one row and no row matches, return `null`. The service decides whether to throw its not-found error.
- Give each public method a JSDoc, as the root `AGENTS.md` describes.

### Reads

Write every backend filter as a Drizzle `WHERE` clause. Never filter rows in JS.

`and()` and `or()` drop each `undefined` argument. Build an optional filter in one expression, without an `if` chain:

```typescript
const rows = await this.db
    .select()
    .from(items)
    .where(
        and(
            search.status === undefined ? undefined : eq(items.status, search.status),
            search.text === undefined
                ? undefined
                : ilike(items.name, toContainsPattern(search.text)),
            search.ids === undefined ? undefined : inArray(items.id, search.ids),
        ),
    )
```

If a `like` or `ilike` pattern holds caller text, escape `\`, `%`, and `_` first. Without the escape, the caller text `%` matches every row. `todo-storage.ts` shows the `toContainsPattern` helper.

For a page, map the page query with `toLimitOffset` from `../utils/pagination`. If the response carries a total, read the count and the page in one read-only transaction. Then `total` matches the page:

```typescript
const whereClause =
    query.status === undefined ? undefined : eq(items.status, query.status)
const { limit, offset } = toLimitOffset(query)

return await this.db.transaction(
    async tx => {
        const [countResult] = await tx
            .select({ value: count() })
            .from(items)
            .where(whereClause)
        const rows = await tx
            .select()
            .from(items)
            .where(whereClause)
            .orderBy(items.id)
            .limit(limit)
            .offset(offset)
        return { items: rows.map(toItem), total: countResult?.value ?? 0 }
    },
    { isolationLevel: "repeatable read", accessMode: "read only" },
)
```

Give each paginated query an `orderBy` on a unique column. Without a stable order, a row can show on two pages or on none.

If two or more reads in one storage class repeat the same joins or computed columns, read `complex-reads.md` in this skill folder.

### Writes

An update or a delete of one row ends with `.returning()`. The method returns the model of that row, or `null` when no row matches the id. The service then decides what a missing row means.

Never read the row first and then write it in a second query. Another writer can change or delete the row between the two queries. Use the row that `.returning()` gives back. If the write must depend on a value read first, see [Read, check, write](#read-check-write).

#### Insert

Write the values field by field. The model and the row can use different names (`completed` and `isCompleted`).

```typescript
public async createItem(item: Item): Promise<void> {
    await this.db.insert(items).values({
        id: item.id,
        name: item.name,
        isActive: item.isActive,
    })
}
```

#### Update

```typescript
public async updateItem(id: string, fields: ItemUpdate): Promise<Item | null> {
    const [row] = await this.db
        .update(items)
        .set({
            name: fields.name,
            description: fields.description,
            isActive: fields.isActive,
        })
        .where(eq(items.id, id))
        .returning()
    return row ? toItem(row) : null
}
```

- Pass each partial field directly to `.set()`. An `undefined` field stays out of the `SET` clause, so the row keeps its value. A `null` field becomes `SET col = NULL`, so the row loses its value.
- Write a field that is nullable and optional as `.nullable().optional()` in the model. An absent field means "keep the value". A `null` field means "clear the value".
- Never map one value to the other with `fields.x ?? null` or `fields.x ?? undefined`. That code removes one of the two operations.
- Never rebuild the row in the service with conditional spreads such as `...(update.x !== undefined && { x: update.x })`.
- Wrap each update schema in `nonEmptyUpdate` from `models`. `.set({})` throws `No values to set` when every field is `undefined`. Without the wrapper, the body `{}` makes the API return 500 in place of 400.

#### Delete

```typescript
public async deleteItem(id: string): Promise<Item | null> {
    const [row] = await this.db.delete(items).where(eq(items.id, id)).returning()
    return row ? toItem(row) : null
}
```

- If the delete is idempotent, the service ignores the result. `TodoService.deleteTodo` returns 204 for an unknown id.
- If an unknown id is an error, the service throws on `null`. `FilesService.delete` returns 404.
- If the service needs a column of the deleted row, it reads the column from the result. `FilesService.delete` reads `objectKey` this way to delete the object.

### Transactions

Use a transaction when one method makes two or more writes that must all land or none land. Examples: a row and its child rows, or a set of rows replaced by a delete and an insert.

Do not use one for a single statement. An insert, an update or a delete with `.returning()`, an upsert with `onConflictDoUpdate`, and ``.set({ count: sql`${items.count} + 1` })`` are atomic on their own. If two writes can become one statement, write one statement.

#### Grouped writes

A storage method can group the writes that always go together. Name it for what it writes: `createItemWithTags`, `replaceItemTags`. The method holds no domain rule. It does not decide whether a write happens, it does not compute values, and it does not call another storage class. The service decides, then calls the method.

The transaction lives in the storage method. A service never opens a transaction and never holds `tx`. If a service needs two writes to be atomic, add one storage method that runs both.

```typescript
/**
 * @description Persists one item and its tags
 * @param item Item inserted, carrying its id
 * @param tagIds Tags linked to the item
 */
public async createItemWithTags(item: Item, tagIds: string[]): Promise<void> {
    await this.db.transaction(async tx => {
        await tx.insert(items).values({ id: item.id, name: item.name })
        if (tagIds.length > 0) {
            await tx
                .insert(itemTags)
                .values(tagIds.map(tagId => ({ itemId: item.id, tagId })))
        }
    })
}
```

#### Inside the callback

- Run every query on `tx`. A query on `this.db` takes a second connection from the pool. Under load, each transaction waits for a connection that another transaction holds, and the pool deadlocks.
- Run no network call and no slow work. Load what the method needs before the transaction starts. The transaction holds its connection and its locks until it ends.
- Throw to roll back. A value returned from the callback commits the transaction, `null` included. Return `null` only before the first write.
- A helper that runs a query inside the transaction takes `tx: DbTransaction` from `../db-config`. Never type it `DbInstanceFromSchema` and never default it to `this.db`.

#### Read, check, write

Put the check in the `WHERE` clause of the write when you can: `.where(and(eq(items.id, id), eq(items.status, "draft")))`. Then the write needs no read and no transaction.

If the write must use a value read first, read the row with `.for("update")` in the same transaction. The lock stops another writer between the read and the write.

A row lock does not cover a row that does not exist yet. A rule across rows, such as one unique name or no two overlapping periods, needs a DB constraint: a unique index or an exclusion constraint.

### Schema changes

Each change to `db-schema.ts`, or to a `xxxValues` array that a `pgEnum` uses, needs a migration. `packages/storage/AGENTS.md` holds the migration flow.

To add a table and its storage class, do these steps:

1. If a column is a DB enum, add the `xxxValues` array to the model file. See [Enums](#enums).
2. Add the table to `db-schema.ts`. See [Tables](#tables).
3. Write the Zod models. See `packages/models/AGENTS.md`.
4. Write the storage class and export it from `index.ts`. See [Storage class](#storage-class).
5. Follow the migration flow in `packages/storage/AGENTS.md`.
