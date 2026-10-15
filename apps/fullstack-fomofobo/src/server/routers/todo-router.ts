import "server-only"
import type { OpenAPIHono } from "@hono/zod-openapi"
import { TodoRoutes } from "api-routes"
import { createRouter, respond } from "backend-shared/http"
import { HttpStatus } from "models"

import { toApplicationError } from "../errors"
import type { TodoService } from "../services/todo-service"

/**
 * @description Builds the router mounting every todo route
 * @param service Service backing the handlers
 */
export const buildTodoRouter = (service: TodoService): OpenAPIHono => {
    const router = createRouter()

    router.openapi(TodoRoutes.create, async c => {
        try {
            const creation = c.req.valid("json")
            const todo = await service.createTodo(creation)
            return respond(c, TodoRoutes.create, HttpStatus.Created, todo)
        } catch (error) {
            throw toApplicationError(error, "Error creating todo")
        }
    })

    router.openapi(TodoRoutes.getList, async c => {
        try {
            const todos = await service.getTodos()
            return respond(c, TodoRoutes.getList, HttpStatus.Ok, todos)
        } catch (error) {
            throw toApplicationError(error, "Error fetching todos")
        }
    })

    router.openapi(TodoRoutes.listPaginated, async c => {
        try {
            const query = c.req.valid("query")
            const result = await service.listTodosPaginated(query)
            return respond(c, TodoRoutes.listPaginated, HttpStatus.Ok, result)
        } catch (error) {
            throw toApplicationError(error, "Error fetching paginated todos")
        }
    })

    router.openapi(TodoRoutes.search, async c => {
        try {
            const search = c.req.valid("json")
            const result = await service.searchTodos(search)
            return respond(c, TodoRoutes.search, HttpStatus.Ok, result)
        } catch (error) {
            throw toApplicationError(error, "Error searching todos")
        }
    })

    router.openapi(TodoRoutes.getById, async c => {
        try {
            const id = c.req.valid("param").id
            const todo = await service.getTodo(id)
            return respond(c, TodoRoutes.getById, HttpStatus.Ok, todo)
        } catch (error) {
            throw toApplicationError(error, "Error fetching todo")
        }
    })

    router.openapi(TodoRoutes.update, async c => {
        try {
            const id = c.req.valid("param").id
            const update = c.req.valid("json")
            const todo = await service.updateTodo(id, update)
            return respond(c, TodoRoutes.update, HttpStatus.Ok, todo)
        } catch (error) {
            throw toApplicationError(error, "Error updating todo")
        }
    })

    router.openapi(TodoRoutes.delete, async c => {
        try {
            const id = c.req.valid("param").id
            await service.deleteTodo(id)
            return c.body(null, HttpStatus.NoContent)
        } catch (error) {
            throw toApplicationError(error, "Error deleting todo")
        }
    })

    return router
}
