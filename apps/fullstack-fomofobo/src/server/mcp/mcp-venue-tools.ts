import "server-only"
import type { McpServer } from "@modelcontextprotocol/server"
import { BackofficeVenuesRoutes } from "api-routes"
import {
    venueBlockSchema,
    venueCreationSchema,
    venueKindChangeSchema,
    venueLinksSchema,
    venueSchema,
    venueUpdateSchema,
} from "models"
import { z } from "zod"

import type { McpCall, McpServices } from "./mcp-server"
import { parseToolInput } from "./mcp-tool-input"
import { runTool } from "./mcp-tool-result"
import { BLOCK_RULE, CONFIRMATION_RULE, WRITE_ANNOTATIONS } from "./mcp-write-rules"

const venueShape = venueSchema.shape

const venueChangesInput = z
    .object({
        name: venueShape.name.describe("Name of the venue, at most 120 characters"),
        address: venueShape.address.describe(
            "Address from a search_places result, sent together with its coordinates",
        ),
        coordinates: venueShape.coordinates.describe(
            "Coordinates of the same search_places result as the address",
        ),
        description: venueShape.description.describe(
            "Short description, at most 500 characters, or null to remove it",
        ),
        links: venueLinksSchema
            .partial()
            .describe(
                "Website, Instagram and Facebook URLs of the venue. Each link left out keeps its value, null removes it",
            ),
        removeCoverPhoto: z
            .literal(true)
            .describe(
                "true removes the cover photo. A new cover is uploaded in the backoffice",
            ),
    })
    .partial()

const venueIdInput = z.uuid().describe("Id of the venue, from search_venues")

const createdVenueSchema =
    BackofficeVenuesRoutes.create.responses[201].content["application/json"].schema
const venueResponseSchema =
    BackofficeVenuesRoutes.update.responses[200].content["application/json"].schema

/**
 * @description Registers the tools that write venues on the server
 * @param server MCP server of the request
 * @param services Services that the routers of the backoffice call
 * @param call Account of the request
 */
export const registerVenueTools = (
    server: McpServer,
    services: McpServices,
    call: McpCall,
): void => {
    server.registerTool(
        "create_venue",
        {
            title: "Create venue",
            description: `Creates a venue. Call it only when search_venues finds no match and the user agreed to a new venue. Take the address and the coordinates from a search_places result. ${CONFIRMATION_RULE}`,
            inputSchema: venueCreationSchema,
            annotations: WRITE_ANNOTATIONS,
        },
        input =>
            runTool("create_venue", createdVenueSchema, () =>
                services.venues.create(input, call.account),
            ),
    )

    server.registerTool(
        "update_venue",
        {
            title: "Update venue",
            description: `Changes some fields of a venue and publishes the change at once, on the venue and on every event held there. Every field left out keeps its value. Find the venue with search_venues first. ${CONFIRMATION_RULE}`,
            inputSchema: z.object({
                venueId: venueIdInput,
                changes: venueChangesInput.describe("The fields that change, alone"),
            }),
            annotations: WRITE_ANNOTATIONS,
        },
        ({ venueId, changes: { removeCoverPhoto, ...changes } }) =>
            runTool("update_venue", venueResponseSchema, async () => {
                const current = await services.venues.getById(venueId)
                const update = parseToolInput(venueUpdateSchema, {
                    ...changes,
                    links:
                        changes.links === undefined
                            ? undefined
                            : { ...current.links, ...changes.links },
                    coverPhotoKey: removeCoverPhoto === true ? null : undefined,
                })
                return await services.venues.update(venueId, update, call.account)
            }),
    )

    server.registerTool(
        "set_venue_owner",
        {
            title: "Set venue owner",
            description: `Gives a venue to an organizer, who can then edit it in the backoffice, or takes it back with null. An organizer owns one venue at most, and a permanent venue has no owner. ${CONFIRMATION_RULE}`,
            inputSchema: z.object({
                venueId: venueIdInput,
                ownerId: z
                    .uuid()
                    .nullable()
                    .describe(
                        "Id of the organizer, from search_organizers, or null for no owner",
                    ),
            }),
            annotations: WRITE_ANNOTATIONS,
        },
        ({ venueId, ownerId }) =>
            runTool("set_venue_owner", venueResponseSchema, () =>
                services.venues.setOwner(venueId, ownerId),
            ),
    )

    server.registerTool(
        "set_venue_kind",
        {
            title: "Set venue kind",
            description: `Makes a venue regular, or permanent: a cinema, a museum or a theatre, with a programme link, a category and its closing days. Only a venue with no owner turns permanent, and only Admins edit a permanent venue. ${CONFIRMATION_RULE}`,
            inputSchema: z.object({
                venueId: venueIdInput,
                change: venueKindChangeSchema.describe(
                    "kind regular alone, or a permanent kind with programmeUrl (https), categoryId from list_categories and closingDays: the weekdays it is closed, empty when it never closes",
                ),
            }),
            annotations: WRITE_ANNOTATIONS,
        },
        ({ venueId, change }) =>
            runTool("set_venue_kind", venueResponseSchema, () =>
                services.venues.setKind(venueId, change),
            ),
    )

    server.registerTool(
        "block_venue",
        {
            title: "Block venue",
            description: `Blocks a venue with a reason: no new event can pick it and it loses its public page, while the events already held there stay visible. ${BLOCK_RULE}`,
            inputSchema: z.object({
                venueId: venueIdInput,
                reason: venueBlockSchema.shape.reason.describe(
                    "Why the venue is blocked, at most 280 characters",
                ),
            }),
            annotations: WRITE_ANNOTATIONS,
        },
        ({ venueId, reason }) =>
            runTool("block_venue", venueResponseSchema, () =>
                services.venues.setBlocked(venueId, {
                    isBlocked: true,
                    blockReason: reason,
                }),
            ),
    )

    server.registerTool(
        "unblock_venue",
        {
            title: "Unblock venue",
            description: `Unblocks a venue: events can pick it again and its public page comes back. ${CONFIRMATION_RULE}`,
            inputSchema: z.object({ venueId: venueIdInput }),
            annotations: WRITE_ANNOTATIONS,
        },
        ({ venueId }) =>
            runTool("unblock_venue", venueResponseSchema, () =>
                services.venues.setBlocked(venueId, {
                    isBlocked: false,
                    blockReason: null,
                }),
            ),
    )
}
