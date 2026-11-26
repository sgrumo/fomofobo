import "server-only"
import type { McpServer } from "@modelcontextprotocol/server"
import { BackofficeEventsRoutes } from "api-routes"
import { PLATFORM_TIME_ZONE } from "domain/platform"
import { eventBlockSchema, eventUpsertSchema } from "models"
import type { Event } from "models"
import { z } from "zod"

import { routes } from "@/framework/routes/routes"

import type { McpCall, McpServices } from "./mcp-server"
import { parseToolInput, toEventUpsert } from "./mcp-tool-input"
import { runTool } from "./mcp-tool-result"
import {
    BLOCK_RULE,
    CONFIRMATION_RULE,
    DELETE_RULE,
    WRITE_ANNOTATIONS,
} from "./mcp-write-rules"

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

const eventChangesInput = eventFieldsInput
    .extend({
        photoKeys: eventShape.photoKeys.describe(
            "Keys of the photos of the event, from get_event, in their new order: the first is the cover. Leave a key out to remove that photo. A key that get_event does not list fails",
        ),
    })
    .partial()

const eventIdInput = z.uuid().describe("Id of the event, from list_events")

const savedEventSchema = z.object({
    event: BackofficeEventsRoutes.create.responses[201].content["application/json"]
        .schema,
    backofficeUrl: z.url(),
})
const eventSchema =
    BackofficeEventsRoutes.block.responses[200].content["application/json"].schema
const deletedEventSchema = z.object({ deletedEventId: z.uuid() })

/**
 * @description Registers the tools that write events on the server
 * @param server MCP server of the request
 * @param services Services that the routers of the backoffice call
 * @param call Account and origin of the request
 */
export const registerEventTools = (
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
            annotations: WRITE_ANNOTATIONS,
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
                eventId: eventIdInput,
                changes: eventChangesInput.describe(
                    "The fields that change, alone. Each one replaces the whole field, an object field included",
                ),
            }),
            annotations: WRITE_ANNOTATIONS,
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
        "delete_event",
        {
            title: "Delete event",
            description: `Deletes an event with every date and photo: it leaves the map, the saved lists of the visitors and the backoffice. Read it with get_event first. ${DELETE_RULE} To hide an event and keep it, use block_event.`,
            inputSchema: z.object({ eventId: eventIdInput }),
            annotations: WRITE_ANNOTATIONS,
        },
        ({ eventId }) =>
            runTool("delete_event", deletedEventSchema, async () => {
                await services.events.delete(eventId, call.account)
                return { deletedEventId: eventId }
            }),
    )

    server.registerTool(
        "block_event",
        {
            title: "Block event",
            description: `Hides an event from the public map and keeps it in the backoffice, with a reason that the backoffice shows. An edit of the event keeps the block. ${BLOCK_RULE}`,
            inputSchema: z.object({
                eventId: eventIdInput,
                reason: eventBlockSchema.shape.reason.describe(
                    "Why the event is blocked, at most 280 characters",
                ),
            }),
            annotations: WRITE_ANNOTATIONS,
        },
        ({ eventId, reason }) =>
            runTool("block_event", eventSchema, () =>
                services.events.setBlocked(
                    eventId,
                    { isBlocked: true, blockReason: reason },
                    call.account,
                ),
            ),
    )

    server.registerTool(
        "unblock_event",
        {
            title: "Unblock event",
            description: `Shows a blocked event on the public map again, unless its organizer is blocked. ${CONFIRMATION_RULE}`,
            inputSchema: z.object({ eventId: eventIdInput }),
            annotations: WRITE_ANNOTATIONS,
        },
        ({ eventId }) =>
            runTool("unblock_event", eventSchema, () =>
                services.events.setBlocked(
                    eventId,
                    { isBlocked: false, blockReason: null },
                    call.account,
                ),
            ),
    )
}
