import { createRoute, z } from "@hono/zod-openapi"
import {
    paginatedTodoListSchema,
    todoCreationSchema,
    todoListQuerySchema,
    todoSchema,
    todoSearchSchema,
    todoUpdateSchema,
} from "models"

import { badRequestResponse, notFoundResponse } from "./lib/common-responses"

export const TodoRoutes = {
    create: createRoute({
        method: "post",
        path: "/api/todos",
        request: {
            body: {
                required: true,
                content: {
                    "application/json": {
                        schema: todoCreationSchema.openapi("TodoCreationRequest"),
                    },
                },
            },
        },
        responses: {
            201: {
                content: {
                    "application/json": {
                        schema: todoSchema.openapi("Todo"),
                    },
                },
                description: "Todo created successfully",
            },
            400: badRequestResponse,
        },
        tags: ["Todos"],
        summary: "Create todo",
        description: "Create a new todo item",
    }),

    getList: createRoute({
        method: "get",
        path: "/api/todos",
        responses: {
            200: {
                content: {
                    "application/json": {
                        schema: z.array(todoSchema).openapi("TodoList"),
                    },
                },
                description: "List of todos retrieved successfully",
            },
        },
        tags: ["Todos"],
        summary: "Get todos",
        description: "Retrieve a list of all todos",
    }),

    listPaginated: createRoute({
        method: "get",
        path: "/api/todos/paginated",
        request: {
            query: todoListQuerySchema.openapi("TodoListQuery"),
        },
        responses: {
            200: {
                content: {
                    "application/json": {
                        schema: paginatedTodoListSchema.openapi("PaginatedTodoList"),
                    },
                },
                description: "Paginated list of todos",
            },
            400: badRequestResponse,
        },
        tags: ["Todos"],
        summary: "List todos (paginated)",
        description:
            "Retrieve a paginated list of todos. Supports filtering by completion status.",
    }),

    search: createRoute({
        method: "query",
        path: "/api/todos/search",
        request: {
            body: {
                required: true,
                content: {
                    "application/json": {
                        schema: todoSearchSchema.openapi("TodoSearchRequest"),
                    },
                },
            },
        },
        responses: {
            200: {
                content: {
                    "application/json": {
                        schema: z.array(todoSchema).openapi("TodoList"),
                    },
                },
                description: "Matching todos",
            },
            400: badRequestResponse,
        },
        tags: ["Todos"],
        summary: "Search todos",
        description:
            "Search todos by title text, completion status and id list. The QUERY method keeps the read safe and idempotent.",
    }),

    getById: createRoute({
        method: "get",
        path: "/api/todos/{id}",
        request: {
            params: z.object({
                id: z.uuid().openapi("Todo ID"),
            }),
        },
        responses: {
            200: {
                content: {
                    "application/json": {
                        schema: todoSchema.openapi("Todo"),
                    },
                },
                description: "Todo retrieved successfully",
            },
            404: notFoundResponse("Todo"),
        },
        tags: ["Todos"],
        summary: "Get todo by ID",
        description: "Retrieve a todo by its ID",
    }),

    update: createRoute({
        method: "patch",
        path: "/api/todos/{id}",
        request: {
            params: z.object({
                id: z.uuid().openapi("Todo ID"),
            }),
            body: {
                required: true,
                content: {
                    "application/json": {
                        schema: todoUpdateSchema.openapi("TodoUpdateRequest"),
                    },
                },
            },
        },
        responses: {
            200: {
                content: {
                    "application/json": {
                        schema: todoSchema.openapi("Todo"),
                    },
                },
                description: "Todo updated successfully",
            },
            400: badRequestResponse,
            404: notFoundResponse("Todo"),
        },
        tags: ["Todos"],
        summary: "Update todo",
        description: "Update a todo by its ID",
    }),

    delete: createRoute({
        method: "delete",
        path: "/api/todos/{id}",
        request: {
            params: z.object({
                id: z.uuid().openapi("Todo ID"),
            }),
        },
        responses: {
            204: {
                description: "Todo deleted successfully",
            },
            404: notFoundResponse("Todo"),
        },
        tags: ["Todos"],
        summary: "Delete todo",
        description: "Delete a todo by its ID",
    }),
}
