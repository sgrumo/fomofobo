---
name: storage-patterns
description: "Drizzle query patterns for the storage package on Cloudflare D1: filters, search, pagination, inserts, updates, deletes, batches. Also the table, enum, and storage class conventions. Use when you write or change a query, a storage method, or a table."
user-invocable: true
---

## Storage patterns

$ARGUMENTS

The storage package (`packages/storage/`) is a thin DB access layer on Drizzle over Cloudflare D1, which is SQLite. A storage class runs queries, inserts, updates, and deletes. It contains no business logic. Validation, orchestration, id generation, and domain rules live in the service. A storage method can still run several writes that always go together. See [Batches](#batches). Logic that is part of one complex query (an aggregation, a join) can stay in storage.

| Task                                       | Section                           |
| ------------------------------------------ | --------------------------------- |
| Add or change a column                     | [Tables](#tables)                 |
| Add a DB enum                              | [Enums](#enums)                   |
| Add a storage class                        | [Storage class](#storage-class)   |
| Write a filter, a search, or a page        | [Reads](#reads)                   |
| Write an insert, an update, or a delete    | [Writes](#writes)                 |
| Write two or more rows together            | [Batches](#batches)               |
| Add a table, or change one that holds rows | [Schema changes](#schema-changes) |

### Tables

All tables live in `packages/storage/src/db-schema.ts`.

```typescript
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core"

export const items = sqliteTable("items", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    ownerId: text("owner_id").references(() => users.id),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
})
```

- Write DB column names in snake_case and TS fields in camelCase.
- Make the primary key `text("id").primaryKey()`. It holds a UUID that the service generates.
- Write `.notNull()` on each required column. A column without it is nullable.
- Write a foreign key as `text("other_id").references(() => other.id)`. D1 always enforces foreign keys.
- Write a boolean as `integer(..., { mode: "boolean" })`.
- Write an instant as `integer(..., { mode: "timestamp_ms" })`. Drizzle maps it to a `Date`. The service passes the value, so tests and seeds control it.
- Write an ISO date or a local date-time as `text()`. It holds the string of the model.
- Write a JSON value as `text(..., { mode: "json" }).$type<T>()`, with `T` from `models`. The read path trusts the type, so only the storage writes the column.

### Enums

A DB enum takes its values from one `as const` array in the model file. The root `AGENTS.md` holds the naming rules for enum values.

```typescript
// packages/models/src/items.ts
export const itemStatusValues = ["draft", "active", "archived"] as const
export const itemStatusSchema = z.enum(itemStatusValues)
export type ItemStatus = z.infer<typeof itemStatusSchema>
```

```typescript
// packages/storage/src/db-schema.ts
import { sql } from "drizzle-orm"
import { check, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { itemStatusValues } from "models"

/**
 * @description Builds the quoted SQL list of enum values for a CHECK constraint
 * @param values Kebab-case values of a model enum
 */
const sqlValueList = (values: readonly string[]) =>
    sql.raw(values.map(value => `'${value}'`).join(", "))

export const items = sqliteTable(
    "items",
    {
        status: text("status", { enum: itemStatusValues }).notNull(),
    },
    table => [
        check(
            "items_status_check",
            sql`${table.status} in (${sqlValueList(itemStatusValues)})`,
        ),
    ],
)
```

- Each DB enum exports three things from models: `xxxValues`, `xxxSchema`, and `type Xxx`.
- Never copy the values into storage. Import the `xxxValues` array.
- SQLite has no enum type. `text({ enum })` types the column in TypeScript, and the CHECK constraint rejects a value outside the array in the database.
- `sql.raw` is safe here only because the values are code constants. Never pass caller text to it.
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
- The class is concrete. The constructor takes `DbInstanceFromSchema`, which `buildDbInstance` builds from the D1 binding. Build it per request from `getCloudflareContext().env.DB`. That call works only inside a request, never at module scope.
- Write one `toXxx` mapper per table, typed on `typeof table.$inferSelect`. Each method that returns rows uses it.
- If a method targets one row and no row matches, return `null`. The service decides whether to throw its not-found error.
- Give each public method a JSDoc, as the root `AGENTS.md` describes.

### Reads

Write every backend filter as a Drizzle `WHERE` clause. Never filter rows in JS.

`and()` and `or()` drop each `undefined` argument. Build an optional filter in one expression, without an `if` chain:

```typescript
/**
 * @description Builds a `like` pattern that matches the text anywhere, with its wildcards escaped
 * @param text Caller text searched
 */
const toContainsPattern = (text: string) => `%${text.replaceAll(/[\\%_]/gu, "\\$&")}%`

const rows = await this.db
    .select()
    .from(items)
    .where(
        and(
            search.status === undefined ? undefined : eq(items.status, search.status),
            search.text === undefined
                ? undefined
                : sql`${items.name} like ${toContainsPattern(search.text)} escape '\\'`,
            search.ids === undefined ? undefined : inArray(items.id, search.ids),
        ),
    )
```

- SQLite has no `ilike`. `like` ignores case for ASCII letters only, so `É` and `é` differ.
- SQLite `like` has no default escape character. If a pattern holds caller text, escape `\`, `%`, and `_` with a backslash, and write `escape '\\'` in the clause as above. Without both, the caller text `%` matches every row.
- One query binds at most 100 parameters. An `inArray` over caller ids counts one parameter per id: cap the list in the model, or split the read.

For a page, map the page query with `toLimitOffset` from `../utils/pagination`. If the response carries a total, read the count and the page in one `batch`. A batch runs as one transaction, so `total` matches the page:

```typescript
const whereClause =
    query.status === undefined ? undefined : eq(items.status, query.status)
const { limit, offset } = toLimitOffset(query)

const [countResult, rows] = await this.db.batch([
    this.db.select({ value: count() }).from(items).where(whereClause),
    this.db
        .select()
        .from(items)
        .where(whereClause)
        .orderBy(items.id)
        .limit(limit)
        .offset(offset),
])
return { items: rows.map(toItem), total: countResult[0]?.value ?? 0 }
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

A multi-row insert binds one parameter per column per row. Split the rows with `chunk` from `es-toolkit` into groups of `Math.floor(100 / columnCount)` rows, one insert per group, all in one batch.

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

- If the delete is idempotent, the service ignores the result and answers `204` for an unknown id.
- If an unknown id is an error, the service throws on `null` and answers `404`.
- If the service needs a column of the deleted row, it reads the column from the result, for example the object key of a file to delete from the bucket.

### Batches

D1 has no interactive transaction. `db.transaction()` sends `BEGIN`, and D1 refuses it. `db.batch([...])` runs its statements in order as one transaction: they all land, or a failure rolls them all back.

Use a batch when one method makes two or more writes that must all land or none land. Examples: a row and its child rows, or a set of rows replaced by a delete and an insert.

Do not use one for a single statement. An insert, an update or a delete with `.returning()`, an upsert with `onConflictDoUpdate`, and ``.set({ count: sql`${items.count} + 1` })`` are atomic on their own. If two writes can become one statement, write one statement.

#### Grouped writes

A storage method can group the writes that always go together. Name it for what it writes: `createItemWithTags`, `replaceItemTags`. The method holds no domain rule. It does not decide whether a write happens, it does not compute values, and it does not call another storage class. The service decides, then calls the method.

The batch lives in the storage method. A service never builds a batch. If a service needs two writes to be atomic, add one storage method that runs both.

```typescript
/**
 * @description Persists one item and its tags
 * @param item Item inserted, carrying its id
 * @param tagIds Tags linked to the item
 */
public async createItemWithTags(item: Item, tagIds: string[]): Promise<void> {
    const insertItem = this.db.insert(items).values({ id: item.id, name: item.name })
    await (tagIds.length === 0
        ? insertItem
        : this.db.batch([
              insertItem,
              this.db
                  .insert(itemTags)
                  .values(tagIds.map(tagId => ({ itemId: item.id, tagId }))),
          ]))
}
```

#### Inside a batch

- Build each statement on `this.db` and pass it unawaited. An awaited statement runs on its own, outside the batch.
- A statement cannot read the result of an earlier one. Decide every value before the batch: generate the ids in the service, pass them in.
- Run no network call between the reads and the batch that depends on them. Load what the method needs first.

#### Read, check, write

Put the check in the `WHERE` clause of the write: `.where(and(eq(items.id, id), eq(items.status, "draft")))`. Then the write needs no read and no batch.

If the write must use a value read first, write it with a `WHERE` that repeats the value read: the update matches no row when another writer changed it in between. `.returning()` then gives an empty array, and the service decides what that means. D1 has no `SELECT ... FOR UPDATE`.

A rule across rows, such as one unique name or one primary row per parent, needs a DB constraint: a unique index, or a partial unique index.

### Schema changes

Each change to `db-schema.ts`, or to a `xxxValues` array that a CHECK constraint lists, needs a migration. `packages/storage/AGENTS.md` holds the migration flow.

To add a table and its storage class, do these steps:

1. If a column is a DB enum, add the `xxxValues` array to the model file. See [Enums](#enums).
2. Add the table to `db-schema.ts`. See [Tables](#tables).
3. Write the Zod models. See `packages/models/AGENTS.md`.
4. Write the storage class and export it from `index.ts`. See [Storage class](#storage-class).
5. Follow the migration flow in `packages/storage/AGENTS.md`.
