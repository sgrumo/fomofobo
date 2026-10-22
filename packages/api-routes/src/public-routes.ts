import { createRoute, z } from "@hono/zod-openapi"
import {
    categorySchema,
    localDateSchema,
    occurrenceDetailSchema,
    occurrenceLookupQuerySchema,
    occurrenceSummarySchema,
    paginatedResponseSchema,
    placeSearchQuerySchema,
    publicVenueSchema,
    publicSearchQuerySchema,
    publicSearchResponseSchema,
    searchSuggestionsSchema,
    venueHistoryItemSchema,
    venueHistoryQuerySchema,
} from "models"

import {
    badRequestResponse,
    notFoundResponse,
    serviceUnavailableResponse,
    tooManyRequestsResponse,
} from "./lib/common-responses"

export const PublicRoutes = {
    listCategories: createRoute({
        method: "get",
        path: "/api/public/categories",
        responses: {
            200: {
                content: {
                    "application/json": {
                        schema: z
                            .array(categorySchema.openapi("Category"))
                            .openapi("CategoryList"),
                    },
                },
                description: "Every category, by name",
            },
        },
        tags: ["Public"],
        summary: "List categories",
    }),

    searchOccurrences: createRoute({
        method: "get",
        path: "/api/public/occurrences",
        request: {
            query: publicSearchQuerySchema.openapi("PublicSearchQuery"),
        },
        responses: {
            200: {
                content: {
                    "application/json": {
                        schema: publicSearchResponseSchema.openapi(
                            "PublicSearchResponse",
                        ),
                    },
                },
                description: "Visible occurrences of the area and the window, live first",
            },
            400: badRequestResponse,
        },
        tags: ["Public"],
        summary: "Search occurrences",
        description:
            "Returns the visible occurrences at venues within the search radius of the center, in the date window, with the event count of each category under the other filters.",
    }),

    lookupOccurrences: createRoute({
        method: "get",
        path: "/api/public/occurrences/lookup",
        request: {
            query: occurrenceLookupQuerySchema.openapi("OccurrenceLookupQuery"),
        },
        responses: {
            200: {
                content: {
                    "application/json": {
                        schema: z
                            .array(occurrenceSummarySchema.openapi("OccurrenceSummary"))
                            .openapi("OccurrenceSummaryList"),
                    },
                },
                description: "Visible occurrences of the refs, in ref order",
            },
            400: badRequestResponse,
        },
        tags: ["Public"],
        summary: "Look up saved occurrences",
        description:
            "Returns the occurrences of the refs that are still visible, in the order of the refs. A ref to a single event matches on any date. An occurrence that ended at least the retention days of the platform settings ago is not visible.",
    }),

    getOccurrence: createRoute({
        method: "get",
        path: "/api/public/occurrences/{eventId}/{date}",
        request: {
            params: z.object({
                eventId: z.uuid().openapi("Event ID"),
                date: localDateSchema.openapi("Local start date"),
            }),
        },
        responses: {
            200: {
                content: {
                    "application/json": {
                        schema: occurrenceDetailSchema.openapi("OccurrenceDetail"),
                    },
                },
                description: "Visible occurrence with its photos and links",
            },
            404: notFoundResponse("Occurrence"),
        },
        tags: ["Public"],
        summary: "Get occurrence",
        description:
            "Returns one visible occurrence. A single event matches on any date, so a link survives a change of its date. An occurrence that ended at least the retention days of the platform settings ago is not visible.",
    }),

    searchPlaces: createRoute({
        method: "get",
        path: "/api/public/places",
        request: {
            query: placeSearchQuerySchema.openapi("PlaceSearchQuery"),
        },
        responses: {
            200: {
                content: {
                    "application/json": {
                        schema: searchSuggestionsSchema.openapi("SearchSuggestions"),
                    },
                },
                description: "Places and event titles that match the text",
            },
            400: badRequestResponse,
            429: tooManyRequestsResponse,
            503: serviceUnavailableResponse("Geocoding provider unavailable"),
        },
        tags: ["Public"],
        summary: "Suggest places, events and venues",
        description:
            "Returns the places of the geocoding provider biased to the center, the visible events whose title matches, and the venues of the area whose name matches.",
    }),

    getVenue: createRoute({
        method: "get",
        path: "/api/public/venues/{venueId}",
        request: {
            params: z.object({ venueId: z.uuid().openapi("Venue ID") }),
        },
        responses: {
            200: {
                content: {
                    "application/json": {
                        schema: publicVenueSchema.openapi("PublicVenue"),
                    },
                },
                description: "Venue with its upcoming events",
            },
            404: notFoundResponse("Venue"),
        },
        tags: ["Public"],
        summary: "Get venue",
        description:
            "Returns a venue that is not blocked, with each visible event that has an occurrence not yet ended: live first, then soonest.",
    }),

    listVenueHistory: createRoute({
        method: "get",
        path: "/api/public/venues/{venueId}/history",
        request: {
            params: z.object({ venueId: z.uuid().openapi("Venue ID") }),
            query: venueHistoryQuerySchema.openapi("VenueHistoryQuery"),
        },
        responses: {
            200: {
                content: {
                    "application/json": {
                        schema: paginatedResponseSchema(venueHistoryItemSchema).openapi(
                            "VenueHistoryPage",
                        ),
                    },
                },
                description: "Past events of the venue, newest end first",
            },
            400: badRequestResponse,
            404: notFoundResponse("Venue"),
        },
        tags: ["Public"],
        summary: "List venue history",
        description:
            "Returns the visible events of a venue that is not blocked whose last occurrence ended, with their first and last date.",
    }),
}
