import { keepPreviousData, mutationOptions, queryOptions } from "@tanstack/react-query"
import type { QueryClient } from "@tanstack/react-query"
import { ClientCompatibilityRoutes, FilesRoutes, TodoRoutes } from "api-routes"
import type { TodoCreation, TodoUpdate } from "models"

import { cacheKeys } from "./cache-keys"
import { createEndpointFactories } from "./client"
import type { ApiClientOptions, BodyQueryVariables, QueryVariables } from "./client"

/**
 * @description Returns every request and its TanStack Query options, flat
 * @param options Transport and delay the endpoint factories bind to
 */
export const createApi = (options: ApiClientOptions) => {
    const {
        bodylessQueryEndpoint,
        bodyfulQueryEndpoint,
        responsefulMutationEndpoint,
        responselessMutationEndpoint,
    } = createEndpointFactories(options)

    const listTodos = bodylessQueryEndpoint(TodoRoutes.getList, 200)
    const listTodosQuery = (variables: QueryVariables<typeof TodoRoutes.getList>) =>
        queryOptions({
            queryFn: () => listTodos(variables),
            queryKey: cacheKeys.todoList(),
        })

    const listPaginatedTodos = bodylessQueryEndpoint(TodoRoutes.listPaginated, 200)
    const listPaginatedTodosQuery = (
        variables: QueryVariables<typeof TodoRoutes.listPaginated>,
    ) =>
        queryOptions({
            queryFn: () => listPaginatedTodos(variables),
            queryKey: cacheKeys.todoPaginatedList(variables),
            placeholderData: keepPreviousData,
        })

    const searchTodos = bodyfulQueryEndpoint(TodoRoutes.search, 200)
    const searchTodosQuery = (variables: BodyQueryVariables<typeof TodoRoutes.search>) =>
        queryOptions({
            queryFn: () => searchTodos(variables),
            queryKey: cacheKeys.todoSearch(variables),
            placeholderData: keepPreviousData,
        })

    const getTodo = bodylessQueryEndpoint(TodoRoutes.getById, 200)
    const getTodoQuery = (variables: QueryVariables<typeof TodoRoutes.getById>) =>
        queryOptions({
            queryFn: () => getTodo(variables),
            queryKey: cacheKeys.todo(variables),
        })

    const invalidateTodoLists = (client: QueryClient) =>
        Promise.all([
            client.invalidateQueries({ queryKey: cacheKeys.allTodos }),
            client.invalidateQueries({ queryKey: cacheKeys.allPaginatedTodos }),
            client.invalidateQueries({ queryKey: cacheKeys.allSearchedTodos }),
        ])

    const createTodo = responsefulMutationEndpoint(TodoRoutes.create, 201)
    const createTodoMutation = mutationOptions({
        mutationFn: (body: TodoCreation) => createTodo({ params: {}, body }),
        onSuccess: (_1, _2, _3, ctx) => invalidateTodoLists(ctx.client),
    })

    const updateTodo = responsefulMutationEndpoint(TodoRoutes.update, 200)
    const updateTodoMutation = mutationOptions({
        mutationFn: (arg: { id: string; body: TodoUpdate }) =>
            updateTodo({ params: { id: arg.id }, body: arg.body }),
        onSuccess: (_1, _2, _3, ctx) => invalidateTodoLists(ctx.client),
    })

    const deleteTodo = responselessMutationEndpoint(TodoRoutes.delete)
    const deleteTodoMutation = mutationOptions({
        mutationFn: (arg: { id: string }) =>
            deleteTodo({ params: { id: arg.id }, body: undefined }),
        onSuccess: (_1, _2, _3, ctx) => invalidateTodoLists(ctx.client),
    })

    const listFiles = bodylessQueryEndpoint(FilesRoutes.getList, 200)
    const listFilesQuery = (variables: QueryVariables<typeof FilesRoutes.getList>) =>
        queryOptions({
            queryFn: () => listFiles(variables),
            queryKey: cacheKeys.fileList(),
        })

    // Mints a short-lived URL, so the call stays imperative and carries no query options.
    const getFileDownloadUrl = bodylessQueryEndpoint(FilesRoutes.download, 200)

    // Two steps of one flow. Each app composes them into its own upload mutation, since
    // the object storage POST between them needs a platform-specific file handle.
    const requestFileUpload = responsefulMutationEndpoint(FilesRoutes.requestUpload, 200)
    const finalizeFileUpload = responsefulMutationEndpoint(FilesRoutes.finalize, 201)

    const deleteFile = responselessMutationEndpoint(FilesRoutes.delete)
    const deleteFileMutation = mutationOptions({
        mutationFn: (arg: { id: string }) =>
            deleteFile({ params: { id: arg.id }, body: undefined }),
        onSuccess: (_1, _2, _3, ctx) =>
            ctx.client.invalidateQueries({ queryKey: cacheKeys.allFiles }),
    })

    // The platform and the version travel as headers, which the transport of each app
    // adds to every request. So the call itself takes no variable.
    const checkClientCompatibility = bodylessQueryEndpoint(
        ClientCompatibilityRoutes.check,
        200,
    )
    const checkClientCompatibilityQuery = (
        variables: QueryVariables<typeof ClientCompatibilityRoutes.check>,
    ) =>
        queryOptions({
            queryFn: () => checkClientCompatibility(variables),
            queryKey: cacheKeys.allClientCompatibility,
        })

    return {
        listTodos,
        listTodosQuery,
        listPaginatedTodos,
        listPaginatedTodosQuery,
        searchTodos,
        searchTodosQuery,
        getTodo,
        getTodoQuery,
        createTodo,
        createTodoMutation,
        updateTodo,
        updateTodoMutation,
        deleteTodo,
        deleteTodoMutation,
        listFiles,
        listFilesQuery,
        getFileDownloadUrl,
        requestFileUpload,
        finalizeFileUpload,
        deleteFile,
        deleteFileMutation,
        checkClientCompatibility,
        checkClientCompatibilityQuery,
    }
}

export type Api = ReturnType<typeof createApi>
