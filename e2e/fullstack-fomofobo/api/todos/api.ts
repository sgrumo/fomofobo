import { TodoRoutes } from "api-routes"

import { createApiCall } from "../api"

export const createTodo = createApiCall(TodoRoutes.create)
export const getTodos = createApiCall(TodoRoutes.getList)
export const listTodosPaginated = createApiCall(TodoRoutes.listPaginated)
export const searchTodos = createApiCall(TodoRoutes.search)
export const getTodoById = createApiCall(TodoRoutes.getById)
export const updateTodo = createApiCall(TodoRoutes.update)
export const deleteTodo = createApiCall(TodoRoutes.delete)
