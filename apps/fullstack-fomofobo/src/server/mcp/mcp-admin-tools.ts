import "server-only"
import type { McpServer } from "@modelcontextprotocol/server"
import {
    BackofficeCategoriesRoutes,
    BackofficeOrganizersRoutes,
    BackofficeSettingsRoutes,
} from "api-routes"
import {
    categoryCreationSchema,
    categoryUpdateSchema,
    organizerCreationSchema,
    platformSettingsUpdateSchema,
} from "models"
import { z } from "zod"

import { routes } from "@/framework/routes/routes"

import type { McpCall, McpServices } from "./mcp-server"
import { parseToolInput } from "./mcp-tool-input"
import { runTool } from "./mcp-tool-result"
import {
    BLOCK_RULE,
    CONFIRMATION_RULE,
    DELETE_RULE,
    WRITE_ANNOTATIONS,
} from "./mcp-write-rules"

const categoryShape = categoryCreationSchema.shape

const categoryIdInput = z.uuid().describe("Id of the category, from list_categories")
const organizerIdInput = z.uuid().describe("Id of the organizer, from search_organizers")

const categorySchema =
    BackofficeCategoriesRoutes.update.responses[200].content["application/json"].schema
const deletedCategorySchema = z.object({ deletedCategoryId: z.uuid() })
const organizerSchema =
    BackofficeOrganizersRoutes.block.responses[200].content["application/json"].schema
const createdOrganizerSchema = z.object({
    organizer: organizerSchema,
    backofficeUrl: z.url(),
})
const settingsSchema =
    BackofficeSettingsRoutes.update.responses[200].content["application/json"].schema

/**
 * @description Registers the Admin tools of the categories, the organizers and the platform settings
 * @param server MCP server of the request
 * @param services Services that the routers of the backoffice call
 * @param call Account and origin of the request
 */
export const registerAdminTools = (
    server: McpServer,
    services: McpServices,
    call: McpCall,
): void => {
    server.registerTool(
        "create_category",
        {
            title: "Create category",
            description: `Creates an event category with a unique name and an icon. Check with list_categories that it does not exist yet. ${CONFIRMATION_RULE} An image is added in the backoffice.`,
            inputSchema: z.object({
                name: categoryShape.name.describe(
                    "Unique name of the category, at most 60 characters",
                ),
                icon: categoryShape.icon.describe(
                    "Icon that marks the category on the filter chips and on the map pins",
                ),
            }),
            annotations: WRITE_ANNOTATIONS,
        },
        input =>
            runTool("create_category", categorySchema, () =>
                services.categories.create(input),
            ),
    )

    server.registerTool(
        "update_category",
        {
            title: "Update category",
            description: `Changes the name or the icon of a category, or removes its image, on every event and venue that uses it. Every field left out keeps its value. ${CONFIRMATION_RULE}`,
            inputSchema: z.object({
                categoryId: categoryIdInput,
                changes: z
                    .object({
                        name: categoryShape.name.describe(
                            "Unique name of the category, at most 60 characters",
                        ),
                        icon: categoryShape.icon.describe("Icon of the category"),
                        removeImage: z
                            .literal(true)
                            .describe(
                                "true removes the image. A new image is uploaded in the backoffice",
                            ),
                    })
                    .partial()
                    .describe("The fields that change, alone"),
            }),
            annotations: WRITE_ANNOTATIONS,
        },
        ({ categoryId, changes: { removeImage, ...changes } }) =>
            runTool("update_category", categorySchema, () =>
                services.categories.update(
                    categoryId,
                    parseToolInput(categoryUpdateSchema, {
                        ...changes,
                        imageKey: removeImage === true ? null : undefined,
                    }),
                ),
            ),
    )

    server.registerTool(
        "delete_category",
        {
            title: "Delete category",
            description: `Deletes a category. The server refuses while an event or a permanent venue uses it: move them to another category first. ${DELETE_RULE}`,
            inputSchema: z.object({ categoryId: categoryIdInput }),
            annotations: WRITE_ANNOTATIONS,
        },
        ({ categoryId }) =>
            runTool("delete_category", deletedCategorySchema, async () => {
                await services.categories.delete(categoryId)
                return { deletedCategoryId: categoryId }
            }),
    )

    server.registerTool(
        "create_organizer",
        {
            title: "Create organizer",
            description: `Creates an organizer account with a name and an email. The account cannot sign in yet: the answer holds backofficeUrl, where the Admin sets its first password and hands it over. Never ask for a password in the chat. Check with search_organizers that the account does not exist yet. ${CONFIRMATION_RULE}`,
            inputSchema: z.object({
                name: organizerCreationSchema.shape.name.describe(
                    "Name of the organizer as the backoffice shows it",
                ),
                email: organizerCreationSchema.shape.email.describe(
                    "Email the organizer signs in with",
                ),
            }),
            annotations: WRITE_ANNOTATIONS,
        },
        ({ name, email }) =>
            runTool("create_organizer", createdOrganizerSchema, async () => ({
                // A password that nobody knows: the Admin sets the first one in the backoffice
                organizer: await services.organizers.create({
                    name,
                    email,
                    password: `${crypto.randomUUID()}${crypto.randomUUID()}`,
                }),
                backofficeUrl: new URL(
                    routes.backofficeOrganizers.path({
                        parameters: {},
                        query: { q: email },
                    }),
                    call.appUrl,
                ).toString(),
            })),
    )

    server.registerTool(
        "block_organizer",
        {
            title: "Block organizer",
            description: `Blocks an organizer account: it cannot sign in, loses every open session, and all its events leave the public map. ${BLOCK_RULE}`,
            inputSchema: z.object({ organizerId: organizerIdInput }),
            annotations: WRITE_ANNOTATIONS,
        },
        ({ organizerId }) =>
            runTool("block_organizer", organizerSchema, () =>
                services.organizers.setBlocked(organizerId, true),
            ),
    )

    server.registerTool(
        "unblock_organizer",
        {
            title: "Unblock organizer",
            description: `Unblocks an organizer account: it signs in again, and its events that are not blocked come back on the public map. ${CONFIRMATION_RULE}`,
            inputSchema: z.object({ organizerId: organizerIdInput }),
            annotations: WRITE_ANNOTATIONS,
        },
        ({ organizerId }) =>
            runTool("unblock_organizer", organizerSchema, () =>
                services.organizers.setBlocked(organizerId, false),
            ),
    )

    server.registerTool(
        "update_settings",
        {
            title: "Update settings",
            description: `Changes the platform settings. Every field left out keeps its value. Read them with get_settings first. ${CONFIRMATION_RULE}`,
            inputSchema: z.object({
                changes: z
                    .object({
                        endedVisibleDays:
                            platformSettingsUpdateSchema.shape.endedVisibleDays.describe(
                                "Days an ended event stays on the public map, from 0 to 90. After them a daily job deletes its photos",
                            ),
                        participantThreshold:
                            platformSettingsUpdateSchema.shape.participantThreshold.describe(
                                "Count of saves from which the public app shows the count of an event, from 1 to 1000",
                            ),
                    })
                    .partial()
                    .describe("The fields that change, alone"),
            }),
            annotations: WRITE_ANNOTATIONS,
        },
        ({ changes }) =>
            runTool("update_settings", settingsSchema, async () => {
                const current = await services.settings.get()
                return await services.settings.update(
                    parseToolInput(platformSettingsUpdateSchema, {
                        endedVisibleDays: current.endedVisibleDays,
                        participantThreshold: current.participantThreshold,
                        ...changes,
                    }),
                    call.account,
                )
            }),
    )
}
