import "server-only"
import type { McpServer } from "@modelcontextprotocol/server"
import { BackofficeEventsRoutes, BackofficeVenuesRoutes } from "api-routes"
import { PLATFORM_TIME_ZONE } from "domain/platform"
import { eventUpsertSchema, venueCreationSchema } from "models"
import type { Event } from "models"
import { z } from "zod"

import { routes } from "@/framework/routes/routes"

import type { McpCall, McpServices } from "./mcp-server"
import { parseToolInput, toEventUpsert } from "./mcp-tool-input"
import { runTool } from "./mcp-tool-result"

const eventShape = eventUpsertSchema.shape

const eventFieldsInput = z.object({
    title: eventShape.title.describe(
        "Title as the source writes it, at most 120 characters",
    ),
    description: eventShape.description.describe(
        "Short description, at most 280 characters, or null",
    ),
    categoryIds: eventShape.categoryIds.describe(
        "Ids of the categories, from list_categories; at least one",
    ),
    primaryCategoryId: eventShape.primaryCategoryId.describe(
        "One of categoryIds: its icon marks the pin on the map",
    ),
    venueId: eventShape.venueId.describe(
        "Id of the venue, from search_venues or create_venue",
    ),
    startsAt: eventShape.startsAt.describe(
        `Start as a wall-clock time in ${PLATFORM_TIME_ZONE}, YYYY-MM-DDTHH:mm, with no seconds and no offset: the time as the source reads it`,
    ),
    endsAt: eventShape.endsAt.describe(
        "End in the same form, after the start and at most 24 hours later. Ask the user when the source gives none",
    ),
    recurrence: eventShape.recurrence.describe(
        "null for one date. For dates that repeat on a weekly or monthly rule: the rule up to its last date, plus the dates added to or removed from it. When the source lists several dates and you cannot tell one repeating event from several events, ask the user",
    ),
    externalLinks: eventShape.externalLinks.describe(
        "Instagram and Facebook URLs of the event, each null when the source gives none",
    ),
    priceScheme: eventShape.priceScheme.describe(
        "Every amount in euro cents: 5 € is 500. A free event takes no price; a paid one takes a full price, a reduced price or a note",
    ),
    capacity: eventShape.capacity.describe(
        "Places available, or null when the source does not say",
    ),
    organizerId: z
        .uuid()
        .describe(
            "Id of the organizer, from search_organizers. Ask the user when the source does not name one",
        ),
})

const savedEventSchema = z.object({
    event: BackofficeEventsRoutes.create.responses[201].content["application/json"]
        .schema,
    backofficeUrl: z.url(),
})
const createdVenueSchema =
    BackofficeVenuesRoutes.create.responses[201].content["application/json"].schema

const write = { readOnlyHint: false, destructiveHint: true, openWorldHint: false }

const CONFIRMATION_RULE =
    "Before you call it, show the user every field you will send and wait for a clear yes. Never invent a value that the source does not give: ask."

/**
 * @description Registers the tools that write events and venues on the server
 * @param server MCP server of the request
 * @param services Services that the routers of the backoffice call
 * @param call Account and origin of the request
 */
export const registerWriteTools = (
    server: McpServer,
    services: McpServices,
    call: McpCall,
): void => {
    const withBackofficeUrl = (event: Event) => ({
        event,
        backofficeUrl: new URL(
            routes.backofficeEvent.path({ parameters: { id: event.id }, query: {} }),
            call.appUrl,
        ).toString(),
    })

    server.registerTool(
        "create_event",
        {
            title: "Create event",
            description: `Creates an event with no photo and publishes it at once on the public map. ${CONFIRMATION_RULE} Check with list_events that the event does not exist yet. The answer holds backofficeUrl: give it to the user, who adds the photos there.`,
            inputSchema: eventFieldsInput,
            annotations: write,
        },
        input =>
            runTool("create_event", savedEventSchema, async () =>
                withBackofficeUrl(
                    await services.events.create(
                        parseToolInput(eventUpsertSchema, { ...input, photoKeys: [] }),
                        call.account,
                    ),
                ),
            ),
    )

    server.registerTool(
        "update_event",
        {
            title: "Update event",
            description: `Changes some fields of an event and publishes the change at once. Every field left out keeps its value, the photos included. ${CONFIRMATION_RULE}`,
            inputSchema: z.object({
                eventId: z.uuid().describe("Id of the event"),
                changes: eventFieldsInput
                    .partial()
                    .describe(
                        "The fields that change, alone. Each one replaces the whole field, an object field included",
                    ),
            }),
            annotations: write,
        },
        ({ eventId, changes }) =>
            runTool("update_event", savedEventSchema, async () => {
                const current = await services.events.getById(eventId, call.account)
                const upsert = parseToolInput(eventUpsertSchema, {
                    ...toEventUpsert(current),
                    ...changes,
                })
                return withBackofficeUrl(
                    await services.events.update(eventId, upsert, call.account),
                )
            }),
    )

    server.registerTool(
        "create_venue",
        {
            title: "Create venue",
            description: `Creates a venue. Call it only when search_venues finds no match and the user agreed to a new venue. Take the address and the coordinates from a search_places result. ${CONFIRMATION_RULE}`,
            inputSchema: venueCreationSchema,
            annotations: write,
        },
        input =>
            runTool("create_venue", createdVenueSchema, () =>
                services.venues.create(input, call.account),
            ),
    )
}
