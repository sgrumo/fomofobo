import { sql } from "drizzle-orm"
import {
    check,
    index,
    integer,
    primaryKey,
    real,
    sqliteTable,
    text,
    uniqueIndex,
} from "drizzle-orm/sqlite-core"
import type { Recurrence } from "models"
import { accountRoleValues, categoryIconValues } from "models"

/**
 * @description Builds the quoted SQL list of enum values for a CHECK constraint
 * @param values Kebab-case values of a model enum
 */
const sqlValueList = (values: readonly string[]) =>
    sql.raw(values.map(value => `'${value}'`).join(", "))

export const accounts = sqliteTable(
    "accounts",
    {
        id: text("id").primaryKey(),
        name: text("name").notNull(),
        // Lower case only: the unique constraint compares case-sensitively
        email: text("email").notNull().unique(),
        role: text("role", { enum: accountRoleValues }).notNull(),
        isBlocked: integer("is_blocked", { mode: "boolean" }).notNull().default(false),
        blockedAt: integer("blocked_at", { mode: "timestamp_ms" }),
        emailVerified: integer("email_verified", { mode: "boolean" })
            .notNull()
            .default(false),
        image: text("image"),
        createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
        updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
    },
    table => [
        check(
            "accounts_role_check",
            sql`${table.role} in (${sqlValueList(accountRoleValues)})`,
        ),
    ],
)

export const authSessions = sqliteTable(
    "auth_sessions",
    {
        id: text("id").primaryKey(),
        accountId: text("account_id")
            .notNull()
            .references(() => accounts.id, { onDelete: "cascade" }),
        token: text("token").notNull().unique(),
        expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
        ipAddress: text("ip_address"),
        userAgent: text("user_agent"),
        createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
        updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
    },
    table => [index("auth_sessions_account_id_idx").on(table.accountId)],
)

export const authCredentials = sqliteTable(
    "auth_credentials",
    {
        id: text("id").primaryKey(),
        accountId: text("account_id")
            .notNull()
            .references(() => accounts.id, { onDelete: "cascade" }),
        providerId: text("provider_id").notNull(),
        // Equals `account_id` for a password credential
        providerAccountId: text("provider_account_id").notNull(),
        password: text("password"),
        accessToken: text("access_token"),
        refreshToken: text("refresh_token"),
        idToken: text("id_token"),
        accessTokenExpiresAt: integer("access_token_expires_at", {
            mode: "timestamp_ms",
        }),
        refreshTokenExpiresAt: integer("refresh_token_expires_at", {
            mode: "timestamp_ms",
        }),
        scope: text("scope"),
        createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
        updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
    },
    table => [index("auth_credentials_account_id_idx").on(table.accountId)],
)

export const authVerifications = sqliteTable(
    "auth_verifications",
    {
        id: text("id").primaryKey(),
        identifier: text("identifier").notNull(),
        value: text("value").notNull(),
        expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
        createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
        updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
    },
    table => [index("auth_verifications_identifier_idx").on(table.identifier)],
)

export const authRateLimits = sqliteTable("auth_rate_limits", {
    id: text("id").primaryKey(),
    key: text("key").notNull().unique(),
    count: integer("count").notNull(),
    // Epoch milliseconds as a number: the library compares it with `Date.now()`
    lastRequest: integer("last_request").notNull(),
})

export const rateLimits = sqliteTable("rate_limits", {
    key: text("key").primaryKey(),
    windowStartedAt: integer("window_started_at", { mode: "timestamp_ms" }).notNull(),
    count: integer("count").notNull(),
})

export const categories = sqliteTable(
    "categories",
    {
        id: text("id").primaryKey(),
        name: text("name").notNull().unique(),
        icon: text("icon", { enum: categoryIconValues }).notNull(),
        createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    },
    table => [
        check(
            "categories_icon_check",
            sql`${table.icon} in (${sqlValueList(categoryIconValues)})`,
        ),
    ],
)

export const venues = sqliteTable(
    "venues",
    {
        id: text("id").primaryKey(),
        name: text("name").notNull(),
        address: text("address").notNull(),
        latitude: real("latitude").notNull(),
        longitude: real("longitude").notNull(),
        // PLACEHOLDER(OP-20)
        createdBy: text("created_by").references(() => accounts.id, {
            onDelete: "set null",
        }),
        createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
        updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
    },
    table => [index("venues_coordinates_idx").on(table.latitude, table.longitude)],
)

export const events = sqliteTable(
    "events",
    {
        id: text("id").primaryKey(),
        organizerId: text("organizer_id")
            .notNull()
            .references(() => accounts.id, { onDelete: "restrict" }),
        venueId: text("venue_id")
            .notNull()
            .references(() => venues.id, { onDelete: "restrict" }),
        title: text("title").notNull(),
        // PLACEHOLDER(OP-12)
        description: text("description"),
        startsAtLocal: text("starts_at_local").notNull(),
        endsAtLocal: text("ends_at_local").notNull(),
        recurrence: text("recurrence", { mode: "json" }).$type<Recurrence>(),
        instagramUrl: text("instagram_url"),
        facebookUrl: text("facebook_url"),
        // PLACEHOLDER(OP-14)
        price: text("price"),
        isBlocked: integer("is_blocked", { mode: "boolean" }).notNull().default(false),
        // PLACEHOLDER(OP-22)
        blockReason: text("block_reason"),
        // PLACEHOLDER(OP-23)
        deletedAt: integer("deleted_at", { mode: "timestamp_ms" }),
        createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
        updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
    },
    table => [
        index("events_organizer_idx").on(table.organizerId),
        index("events_visible_venue_idx")
            .on(table.venueId)
            .where(sql`${table.isBlocked} = 0 and ${table.deletedAt} is null`),
    ],
)

export const eventCategories = sqliteTable(
    "event_categories",
    {
        eventId: text("event_id")
            .notNull()
            .references(() => events.id, { onDelete: "cascade" }),
        // PLACEHOLDER(OP-24)
        categoryId: text("category_id")
            .notNull()
            .references(() => categories.id, { onDelete: "restrict" }),
        // PLACEHOLDER(OP-11)
        isPrimary: integer("is_primary", { mode: "boolean" }).notNull().default(false),
    },
    table => [
        primaryKey({ columns: [table.eventId, table.categoryId] }),
        index("event_categories_category_idx").on(table.categoryId),
        uniqueIndex("event_categories_primary_idx")
            .on(table.eventId)
            .where(sql`${table.isPrimary} = 1`),
    ],
)

export const eventPhotos = sqliteTable(
    "event_photos",
    {
        id: text("id").primaryKey(),
        eventId: text("event_id")
            .notNull()
            .references(() => events.id, { onDelete: "cascade" }),
        objectKey: text("object_key").notNull().unique(),
        position: integer("position").notNull(),
        createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    },
    table => [uniqueIndex("event_photos_position_idx").on(table.eventId, table.position)],
)

/**
 * @remarks Replaces its rows on every save of the event, so another table addresses an
 * occurrence by `(event_id, local_date)`, never by a foreign key
 */
export const eventOccurrences = sqliteTable(
    "event_occurrences",
    {
        eventId: text("event_id")
            .notNull()
            .references(() => events.id, { onDelete: "cascade" }),
        localDate: text("local_date").notNull(),
        startsAt: integer("starts_at", { mode: "timestamp_ms" }).notNull(),
        endsAt: integer("ends_at", { mode: "timestamp_ms" }).notNull(),
    },
    table => [
        primaryKey({ columns: [table.eventId, table.localDate] }),
        // PLACEHOLDER(OP-08): overlap with the window
        index("event_occurrences_window_idx").on(table.endsAt, table.startsAt),
    ],
)
