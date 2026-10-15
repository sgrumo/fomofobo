import "server-only"
import type { OpenAPIHono } from "@hono/zod-openapi"
import { FilesRoutes } from "api-routes"
import { createRouter, respond } from "backend-shared/http"
import { HttpStatus } from "models"

import { toApplicationError } from "../errors"
import type { FilesService } from "../services/files-service"

/**
 * @description Builds the router mounting every file route
 * @param service Service backing the handlers
 */
export const buildFilesRouter = (service: FilesService): OpenAPIHono => {
    const router = createRouter()

    router.openapi(FilesRoutes.requestUpload, async c => {
        try {
            const request = c.req.valid("json")
            const result = await service.requestUpload(request)
            return respond(c, FilesRoutes.requestUpload, HttpStatus.Ok, result)
        } catch (error) {
            throw toApplicationError(error, "Error requesting upload")
        }
    })

    router.openapi(FilesRoutes.finalize, async c => {
        try {
            const body = c.req.valid("json")
            const file = await service.finalize(body)
            return respond(c, FilesRoutes.finalize, HttpStatus.Created, file)
        } catch (error) {
            throw toApplicationError(error, "Error finalizing upload")
        }
    })

    router.openapi(FilesRoutes.getList, async c => {
        try {
            const list = await service.list()
            return respond(c, FilesRoutes.getList, HttpStatus.Ok, list)
        } catch (error) {
            throw toApplicationError(error, "Error listing files")
        }
    })

    router.openapi(FilesRoutes.download, async c => {
        try {
            const id = c.req.valid("param").id
            const result = await service.getDownloadUrl(id)
            return respond(c, FilesRoutes.download, HttpStatus.Ok, result)
        } catch (error) {
            throw toApplicationError(error, "Error creating download URL")
        }
    })

    router.openapi(FilesRoutes.delete, async c => {
        try {
            const id = c.req.valid("param").id
            await service.delete(id)
            return c.body(null, HttpStatus.NoContent)
        } catch (error) {
            throw toApplicationError(error, "Error deleting file")
        }
    })

    return router
}
