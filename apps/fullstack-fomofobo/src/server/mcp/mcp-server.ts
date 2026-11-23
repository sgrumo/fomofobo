import "server-only"
import { McpServer } from "@modelcontextprotocol/server"
import {
    BackofficeEventsRoutes,
    BackofficeOrganizersRoutes,
    BackofficeVenuesRoutes,
    PublicRoutes,
} from "api-routes"
import type { Account } from "models"
import { searchSuggestionsSchema } from "models"
import { z } from "zod"

import type { Container } from "../container"
import { runTool } from "./mcp-tool-result"

export type McpServices = Pick<
    Container,
    "categories" | "events" | "organizers" | "places" | "venues"
>

export interface McpCall {
    account: Account
    forwardedFor: string | undefined
    now: Date
}

const PAGE_SIZE = 20

const venuePageSchema =
    BackofficeVenuesRoutes.list.responses[200].content["application/json"].schema
const categoryListSchema =
    PublicRoutes.listCategories.responses[200].content["application/json"].schema
const organizerPageSchema =
    BackofficeOrganizersRoutes.list.responses[200].content["application/json"].schema
const placeListSchema = searchSuggestionsSchema.pick({ places: true })
const eventPageSchema =
    BackofficeEventsRoutes.list.responses[200].content["application/json"].schema
const eventSchema =
    BackofficeEventsRoutes.getById.responses[200].content["application/json"].schema

const readOnly = { readOnlyHint: true, openWorldHint: false }

const pageInput = z
    .number()
    .int()
    .min(1)
    .optional()
    .describe("Page of the results, from 1. Each page holds 20 items")

const textQueryInput = z
    .string()
    .trim()
    .min(1)
    .optional()
    .describe("Part of the name; leave it out to list every item")

/**
 * @description Builds the MCP server of one request, with the backoffice tools of the account
 * @param services Services that the routers of the backoffice call
 * @param call Account, client address and instant of the request
 */
export const buildMcpServer = (services: McpServices, call: McpCall): McpServer => {
    const server = new McpServer({ name: "zonzo-backoffice", version: "1.0.0" })

    server.registerTool(
        "search_venues",
        {
            title: "Search venues",
            description:
                "Searches the venues of Zonzo by name. Every event takes place at one venue: find it before you create an event.",
            inputSchema: z.object({ query: textQueryInput, page: pageInput }),
            annotations: readOnly,
        },
        ({ query, page }) =>
            runTool("search_venues", venuePageSchema, () =>
                services.venues.list({ q: query, page: page ?? 1, pageSize: PAGE_SIZE }),
            ),
    )

    server.registerTool(
        "list_categories",
        {
            title: "List categories",
            description:
                "Lists every event category with its id. An event takes one or more categories; the first one sets the icon of its pin on the map.",
            annotations: readOnly,
        },
        () =>
            runTool("list_categories", categoryListSchema, () =>
                services.categories.list(),
            ),
    )

    server.registerTool(
        "search_organizers",
        {
            title: "Search organizers",
            description:
                "Searches the organizer accounts by name or email. Every event belongs to one organizer: ask the user which one when the source does not say.",
            inputSchema: z.object({ query: textQueryInput, page: pageInput }),
            annotations: readOnly,
        },
        ({ query, page }) =>
            runTool("search_organizers", organizerPageSchema, () =>
                services.organizers.list({
                    q: query,
                    page: page ?? 1,
                    pageSize: PAGE_SIZE,
                }),
            ),
    )

    server.registerTool(
        "search_places",
        {
            title: "Search places",
            description:
                "Searches addresses and places near a point, to build a new venue. Pass the coordinates of the town of the venue as the center.",
            inputSchema: z.object({
                query: z
                    .string()
                    .trim()
                    .min(2)
                    .max(100)
                    .describe("Address or name of the place"),
                lat: z.number().min(-90).max(90).describe("Latitude of the center"),
                lng: z.number().min(-180).max(180).describe("Longitude of the center"),
            }),
            annotations: { ...readOnly, openWorldHint: true },
        },
        ({ query, lat, lng }) =>
            runTool("search_places", placeListSchema, () =>
                services.places.suggest(
                    { q: query, lat, lng },
                    call.forwardedFor,
                    call.now,
                ),
            ),
    )

    server.registerTool(
        "list_events",
        {
            title: "List events",
            description:
                "Lists the events of Zonzo by title and by organizer, latest start first. Use it to check that an event does not exist yet.",
            inputSchema: z.object({
                query: textQueryInput,
                organizerId: z.uuid().optional().describe("Id of the organizer"),
                page: pageInput,
            }),
            annotations: readOnly,
        },
        ({ query, organizerId, page }) =>
            runTool("list_events", eventPageSchema, () =>
                services.events.list(
                    { q: query, organizerId, page: page ?? 1, pageSize: PAGE_SIZE },
                    call.account,
                ),
            ),
    )

    server.registerTool(
        "get_event",
        {
            title: "Get event",
            description: "Reads one event with every field, by id.",
            inputSchema: z.object({ eventId: z.uuid().describe("Id of the event") }),
            annotations: readOnly,
        },
        ({ eventId }) =>
            runTool("get_event", eventSchema, () =>
                services.events.getById(eventId, call.account),
            ),
    )

    return server
}
