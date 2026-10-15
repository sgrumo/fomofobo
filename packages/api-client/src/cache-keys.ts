import type { TodoRoutes } from "api-routes"

import type { BodyQueryVariables, QueryVariables } from "./client"

export const specifier = {
    detail: "detail",
    list: "list",
}

export const cacheKey = {
    todo: "todo",
    todoPaginated: "todoPaginated",
    todoSearch: "todoSearch",
    file: "file",
    clientCompatibility: "clientCompatibility",
}

/**
 * @remarks Every specific key starts with its `all*` prefix, enabling prefix invalidation
 */
export const cacheKeys = (() => {
    const baseTodo = [cacheKey.todo]
    const basePaginatedTodo = [cacheKey.todoPaginated]
    const baseSearchedTodo = [cacheKey.todoSearch]
    const baseFile = [cacheKey.file]
    const baseClientCompatibility = [cacheKey.clientCompatibility]
    const todoList = () => [...baseTodo, specifier.list]
    const todoPaginatedList = (
        variables: QueryVariables<typeof TodoRoutes.listPaginated>,
    ) => [...basePaginatedTodo, variables]
    const todoSearch = (variables: BodyQueryVariables<typeof TodoRoutes.search>) => [
        ...baseSearchedTodo,
        variables,
    ]
    const todo = (variables: QueryVariables<typeof TodoRoutes.getById>) => [
        ...baseTodo,
        specifier.detail,
        variables,
    ]
    const fileList = () => [...baseFile, specifier.list]

    return {
        allTodos: baseTodo,
        allPaginatedTodos: basePaginatedTodo,
        allSearchedTodos: baseSearchedTodo,
        allFiles: baseFile,
        // One global query, so the base array is the whole key.
        allClientCompatibility: baseClientCompatibility,
        todoList,
        todoPaginatedList,
        todoSearch,
        todo,
        fileList,
    } as const
})()
