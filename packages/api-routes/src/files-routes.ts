import { createRoute, z } from "@hono/zod-openapi"
import {
    fileDownloadSchema,
    fileMetadataSchema,
    presignedUploadSchema,
    uploadFinalizeSchema,
    uploadRequestSchema,
} from "models"

import { badRequestResponse, notFoundResponse } from "./lib/common-responses"

export const FilesRoutes = {
    requestUpload: createRoute({
        method: "post",
        path: "/api/files/request-upload",
        request: {
            body: {
                required: true,
                content: {
                    "application/json": {
                        schema: uploadRequestSchema.openapi("UploadRequest"),
                    },
                },
            },
        },
        responses: {
            200: {
                content: {
                    "application/json": {
                        schema: presignedUploadSchema.openapi("PresignedUpload"),
                    },
                },
                description: "Presigned upload ticket created",
            },
            400: badRequestResponse,
        },
        tags: ["Files"],
        summary: "Request a presigned upload",
        description:
            "Returns a presigned POST policy. The client uploads the file directly to object storage; the size range and content-type are enforced by the storage layer at upload time.",
    }),

    finalize: createRoute({
        method: "post",
        path: "/api/files",
        request: {
            body: {
                required: true,
                content: {
                    "application/json": {
                        schema: uploadFinalizeSchema.openapi("UploadFinalize"),
                    },
                },
            },
        },
        responses: {
            201: {
                content: {
                    "application/json": {
                        schema: fileMetadataSchema.openapi("FileMetadata"),
                    },
                },
                description: "File registered after a verified upload",
            },
            400: badRequestResponse,
        },
        tags: ["Files"],
        summary: "Finalize an upload",
        description:
            "Confirms an uploaded object. The server re-verifies existence, size, and content-type against storage before persisting metadata.",
    }),

    getList: createRoute({
        method: "get",
        path: "/api/files",
        responses: {
            200: {
                content: {
                    "application/json": {
                        schema: z.array(fileMetadataSchema).openapi("FileList"),
                    },
                },
                description: "List of files retrieved successfully",
            },
        },
        tags: ["Files"],
        summary: "List files",
        description: "Retrieve metadata for all uploaded files",
    }),

    download: createRoute({
        method: "get",
        path: "/api/files/{id}/download",
        request: {
            params: z.object({
                id: z.uuid().openapi("File ID"),
            }),
        },
        responses: {
            200: {
                content: {
                    "application/json": {
                        schema: fileDownloadSchema.openapi("FileDownload"),
                    },
                },
                description: "Short-lived presigned download URL",
            },
            404: notFoundResponse("File"),
        },
        tags: ["Files"],
        summary: "Get download URL",
        description: "Mint a short-lived presigned GET URL for the file",
    }),

    delete: createRoute({
        method: "delete",
        path: "/api/files/{id}",
        request: {
            params: z.object({
                id: z.uuid().openapi("File ID"),
            }),
        },
        responses: {
            204: {
                description: "File deleted successfully",
            },
            404: notFoundResponse("File"),
        },
        tags: ["Files"],
        summary: "Delete file",
        description: "Delete a file and remove its stored object",
    }),
}
