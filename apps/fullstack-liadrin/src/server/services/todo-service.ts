import "server-only"
import type {
    PaginatedTodoList,
    Todo,
    TodoCreation,
    TodoListQuery,
    TodoSearch,
    TodoUpdate,
} from "models"
import type { TodoStorage } from "storage"

import { appError } from "../errors"

export class TodoService {
    private readonly todoStorage: TodoStorage
    public constructor(todoStorage: TodoStorage) {
        this.todoStorage = todoStorage
    }

    /**
     * @description Persists a new todo, uncompleted, with a fresh id
     * @param creation Title, description and end date of the new todo
     */
    public async createTodo(creation: TodoCreation): Promise<Todo> {
        const todo: Todo = {
            id: crypto.randomUUID(),
            title: creation.title,
            description: creation.description ?? null,
            completed: false,
            endDate: creation.endDate ?? null,
        }

        await this.todoStorage.createTodo(todo)

        return todo
    }

    /**
     * @description Fetches every todo
     */
    public async getTodos(): Promise<Todo[]> {
        return await this.todoStorage.getTodos()
    }

    /**
     * @description Fetches one page of todos with its page counters
     * @param query Page, page size and completed filter
     */
    public async listTodosPaginated(query: TodoListQuery): Promise<PaginatedTodoList> {
        const { items, total } = await this.todoStorage.listTodosPaginated(query)
        return {
            items,
            total,
            page: query.page,
            pageSize: query.pageSize,
            totalPages: Math.ceil(total / query.pageSize),
        }
    }

    /**
     * @description Fetches every todo matching the search criteria
     * @param search Title text, completion status and id list, each one optional
     */
    public async searchTodos(search: TodoSearch): Promise<Todo[]> {
        return await this.todoStorage.searchTodos(search)
    }

    /**
     * @description Fetches one todo, or throws when no row matches the id
     * @param id Todo read
     */
    public async getTodo(id: string): Promise<Todo> {
        const todo = await this.todoStorage.getTodo(id)
        if (!todo) {
            throw appError("ItemNotFound", `Todo with id ${id} not found`)
        }

        return todo
    }

    /**
     * @description Persists the given fields of a todo and returns the updated todo
     * @param id Todo updated
     * @param update Fields replaced, each one optional
     */
    public async updateTodo(id: string, update: TodoUpdate): Promise<Todo> {
        const todo = await this.todoStorage.updateTodo(id, update)
        if (!todo) {
            throw appError("ItemNotFound", `Todo with id ${id} not found`)
        }

        return todo
    }

    /**
     * @description Deletes one todo
     * @param id Todo deleted
     * @remarks Succeeds when no row matches the id
     */
    public async deleteTodo(id: string): Promise<void> {
        await this.todoStorage.deleteTodo(id)
    }
}
