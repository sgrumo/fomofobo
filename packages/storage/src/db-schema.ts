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
import type { Recurrence, ReducedPrice, VenueClosingDays } from "models"
import {
    accountRoleValues,
    activeDevicePlatformValues,
    categoryIconValues,
    venueKindValues,
} from "models"

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

export const authJwks = sqliteTable("auth_jwks", {
    id: text("id").primaryKey(),
    publicKey: text("public_key").notNull(),
    privateKey: text("private_key").notNull(),
    alg: text("alg"),
    crv: text("crv"),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }),
})

// List and object columns of the OAuth tables hold the JSON text that the auth library
// encodes, so they stay plain `text`, never `mode: "json"`
export const authOauthClients = sqliteTable(
    "auth_oauth_clients",
    {
        id: text("id").primaryKey(),
        clientId: text("client_id").notNull().unique(),
        clientSecret: text("client_secret"),
        clientDiscoveryId: text("client_discovery_id"),
        disabled: integer("disabled", { mode: "boolean" }).default(false),
        skipConsent: integer("skip_consent", { mode: "boolean" }),
        enableEndSession: integer("enable_end_session", { mode: "boolean" }),
        subjectType: text("subject_type"),
        scopes: text("scopes"),
        clientCredentialsScopes: text("client_credentials_scopes"),
        accountId: text("account_id").references(() => accounts.id, {
            onDelete: "cascade",
        }),
        name: text("name"),
        uri: text("uri"),
        icon: text("icon"),
        contacts: text("contacts"),
        tos: text("tos"),
        policy: text("policy"),
        softwareId: text("software_id"),
        softwareVersion: text("software_version"),
        softwareStatement: text("software_statement"),
        redirectUris: text("redirect_uris").notNull(),
        postLogoutRedirectUris: text("post_logout_redirect_uris"),
        backchannelLogoutUri: text("backchannel_logout_uri"),
        backchannelLogoutSessionRequired: integer("backchannel_logout_session_required", {
            mode: "boolean",
        }),
        tokenEndpointAuthMethod: text("token_endpoint_auth_method"),
        applicationType: text("application_type"),
        jwks: text("jwks"),
        jwksUri: text("jwks_uri"),
        grantTypes: text("grant_types"),
        responseTypes: text("response_types"),
        requirePKCE: integer("require_pkce", { mode: "boolean" }),
        dpopBoundAccessTokens: integer("dpop_bound_access_tokens", {
            mode: "boolean",
        }).default(false),
        referenceId: text("reference_id"),
        metadata: text("metadata"),
        createdAt: integer("created_at", { mode: "timestamp_ms" }),
        updatedAt: integer("updated_at", { mode: "timestamp_ms" }),
    },
    table => [index("auth_oauth_clients_account_id_idx").on(table.accountId)],
)

export const authOauthResources = sqliteTable("auth_oauth_resources", {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull().unique(),
    name: text("name").notNull(),
    accessTokenTtl: integer("access_token_ttl"),
    refreshTokenTtl: integer("refresh_token_ttl"),
    signingAlgorithm: text("signing_algorithm"),
    signingKeyId: text("signing_key_id"),
    allowedScopes: text("allowed_scopes"),
    customClaims: text("custom_claims"),
    dpopBoundAccessTokensRequired: integer("dpop_bound_access_tokens_required", {
        mode: "boolean",
    }).default(false),
    disabled: integer("disabled", { mode: "boolean" }).default(false),
    policyVersion: integer("policy_version").default(1),
    metadata: text("metadata"),
    createdAt: integer("created_at", { mode: "timestamp_ms" }),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }),
})

export const authOauthClientResources = sqliteTable(
    "auth_oauth_client_resources",
    {
        id: text("id").primaryKey(),
        clientId: text("client_id")
            .notNull()
            .references(() => authOauthClients.clientId, { onDelete: "cascade" }),
        resourceId: text("resource_id")
            .notNull()
            .references(() => authOauthResources.identifier, { onDelete: "cascade" }),
        metadata: text("metadata"),
        createdAt: integer("created_at", { mode: "timestamp_ms" }),
    },
    table => [
        index("auth_oauth_client_resources_client_id_idx").on(table.clientId),
        index("auth_oauth_client_resources_resource_id_idx").on(table.resourceId),
        uniqueIndex("auth_oauth_client_resources_client_resource_idx").on(
            table.clientId,
            table.resourceId,
        ),
    ],
)

export const authOauthRefreshTokens = sqliteTable(
    "auth_oauth_refresh_tokens",
    {
        id: text("id").primaryKey(),
        token: text("token").notNull().unique(),
        clientId: text("client_id")
            .notNull()
            .references(() => authOauthClients.clientId, { onDelete: "cascade" }),
        sessionId: text("session_id").references(() => authSessions.id, {
            onDelete: "set null",
        }),
        accountId: text("account_id")
            .notNull()
            .references(() => accounts.id, { onDelete: "cascade" }),
        referenceId: text("reference_id"),
        authorizationCodeId: text("authorization_code_id"),
        resources: text("resources"),
        requestedUserInfoClaims: text("requested_user_info_claims"),
        scopes: text("scopes").notNull(),
        confirmation: text("confirmation"),
        rotationReplayResponse: text("rotation_replay_response"),
        rotationReplayExpiresAt: integer("rotation_replay_expires_at", {
            mode: "timestamp_ms",
        }),
        authTime: integer("auth_time", { mode: "timestamp_ms" }),
        rotatedAt: integer("rotated_at", { mode: "timestamp_ms" }),
        revoked: integer("revoked", { mode: "timestamp_ms" }),
        expiresAt: integer("expires_at", { mode: "timestamp_ms" }),
        createdAt: integer("created_at", { mode: "timestamp_ms" }),
    },
    table => [
        index("auth_oauth_refresh_tokens_client_id_idx").on(table.clientId),
        index("auth_oauth_refresh_tokens_session_id_idx").on(table.sessionId),
        index("auth_oauth_refresh_tokens_account_id_idx").on(table.accountId),
        index("auth_oauth_refresh_tokens_authorization_code_id_idx").on(
            table.authorizationCodeId,
        ),
    ],
)

export const authOauthAccessTokens = sqliteTable(
    "auth_oauth_access_tokens",
    {
        id: text("id").primaryKey(),
        token: text("token").unique(),
        clientId: text("client_id")
            .notNull()
            .references(() => authOauthClients.clientId, { onDelete: "cascade" }),
        sessionId: text("session_id").references(() => authSessions.id, {
            onDelete: "set null",
        }),
        accountId: text("account_id").references(() => accounts.id, {
            onDelete: "cascade",
        }),
        refreshId: text("refresh_id").references(() => authOauthRefreshTokens.id, {
            onDelete: "cascade",
        }),
        referenceId: text("reference_id"),
        authorizationCodeId: text("authorization_code_id"),
        resources: text("resources"),
        requestedUserInfoClaims: text("requested_user_info_claims"),
        scopes: text("scopes").notNull(),
        confirmation: text("confirmation"),
        revoked: integer("revoked", { mode: "timestamp_ms" }),
        expiresAt: integer("expires_at", { mode: "timestamp_ms" }),
        createdAt: integer("created_at", { mode: "timestamp_ms" }),
    },
    table => [
        index("auth_oauth_access_tokens_client_id_idx").on(table.clientId),
        index("auth_oauth_access_tokens_session_id_idx").on(table.sessionId),
        index("auth_oauth_access_tokens_account_id_idx").on(table.accountId),
        index("auth_oauth_access_tokens_refresh_id_idx").on(table.refreshId),
        index("auth_oauth_access_tokens_authorization_code_id_idx").on(
            table.authorizationCodeId,
        ),
    ],
)

export const authOauthConsents = sqliteTable(
    "auth_oauth_consents",
    {
        id: text("id").primaryKey(),
        clientId: text("client_id")
            .notNull()
            .references(() => authOauthClients.clientId, { onDelete: "cascade" }),
        accountId: text("account_id").references(() => accounts.id, {
            onDelete: "cascade",
        }),
        referenceId: text("reference_id"),
        resources: text("resources"),
        requestedUserInfoClaims: text("requested_user_info_claims"),
        scopes: text("scopes").notNull(),
        createdAt: integer("created_at", { mode: "timestamp_ms" }),
        updatedAt: integer("updated_at", { mode: "timestamp_ms" }),
    },
    table => [
        index("auth_oauth_consents_client_id_idx").on(table.clientId),
        index("auth_oauth_consents_account_id_idx").on(table.accountId),
    ],
)

export const authOauthClientAssertions = sqliteTable("auth_oauth_client_assertions", {
    id: text("id").primaryKey(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
})

export const rateLimits = sqliteTable("rate_limits", {
    key: text("key").primaryKey(),
    windowStartedAt: integer("window_started_at", { mode: "timestamp_ms" }).notNull(),
    count: integer("count").notNull(),
})

// One row at id 1. With no row, the defaults of `models` apply: a reset deletes it
export const platformSettings = sqliteTable(
    "platform_settings",
    {
        id: integer("id").primaryKey(),
        endedVisibleDays: integer("ended_visible_days").notNull(),
        participantThreshold: integer("participant_threshold").notNull(),
        updatedBy: text("updated_by").references(() => accounts.id, {
            onDelete: "set null",
        }),
        updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
    },
    table => [check("platform_settings_single_row", sql`${table.id} = 1`)],
)

export const categories = sqliteTable(
    "categories",
    {
        id: text("id").primaryKey(),
        name: text("name").notNull().unique(),
        icon: text("icon", { enum: categoryIconValues }).notNull(),
        imageObjectKey: text("image_object_key").unique(),
        imageOriginalObjectKey: text("image_original_object_key").unique(),
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
        description: text("description"),
        coverObjectKey: text("cover_object_key").unique(),
        coverOriginalObjectKey: text("cover_original_object_key").unique(),
        websiteUrl: text("website_url"),
        instagramUrl: text("instagram_url"),
        facebookUrl: text("facebook_url"),
        kind: text("kind", { enum: venueKindValues }).notNull().default("regular"),
        programmeUrl: text("programme_url"),
        closingDays: text("closing_days", { mode: "json" }).$type<VenueClosingDays>(),
        categoryId: text("category_id").references(() => categories.id, {
            onDelete: "restrict",
        }),
        createdBy: text("created_by").references(() => accounts.id, {
            onDelete: "set null",
        }),
        ownerId: text("owner_id").references(() => accounts.id, { onDelete: "set null" }),
        isBlocked: integer("is_blocked", { mode: "boolean" }).notNull().default(false),
        blockReason: text("block_reason"),
        createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
        updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
    },
    table => [
        index("venues_coordinates_idx").on(table.latitude, table.longitude),
        uniqueIndex("venues_owner_idx")
            .on(table.ownerId)
            .where(sql`${table.ownerId} is not null`),
    ],
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
        isFree: integer("is_free", { mode: "boolean" }).notNull().default(true),
        fullPriceCents: integer("full_price_cents"),
        reducedPrices: text("reduced_prices", { mode: "json" })
            .$type<ReducedPrice[]>()
            .notNull()
            .default(sql`'[]'`),
        membershipName: text("membership_name"),
        membershipCostCents: integer("membership_cost_cents"),
        minimumAge: integer("minimum_age"),
        priceNotes: text("price_notes"),
        capacity: integer("capacity"),
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
        originalObjectKey: text("original_object_key").unique(),
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

// Keys on the local date, not on an occurrence row: an event write replaces its occurrence rows
export const occurrenceSaves = sqliteTable(
    "occurrence_saves",
    {
        eventId: text("event_id")
            .notNull()
            .references(() => events.id, { onDelete: "cascade" }),
        localDate: text("local_date").notNull(),
        deviceId: text("device_id").notNull(),
        createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    },
    table => [primaryKey({ columns: [table.eventId, table.localDate, table.deviceId] })],
)

export const activeDeviceDays = sqliteTable(
    "active_device_days",
    {
        deviceId: text("device_id").notNull(),
        localDate: text("local_date").notNull(),
        platform: text("platform", { enum: activeDevicePlatformValues }).notNull(),
        appVersion: text("app_version"),
    },
    table => [
        primaryKey({ columns: [table.deviceId, table.localDate] }),
        index("active_device_days_date_idx").on(table.localDate),
        check(
            "active_device_days_platform_check",
            sql`${table.platform} in (${sqlValueList(activeDevicePlatformValues)})`,
        ),
    ],
)
