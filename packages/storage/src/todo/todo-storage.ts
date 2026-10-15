import { and, count, eq, ilike, inArray } from "drizzle-orm"
import type { Todo, TodoListQuery, TodoSearch, TodoUpdate } from "models"

import type { DbInstanceFromSchema } from "../db-config"
import { todos } from "../db-schema"
import { toLimitOffset } from "../utils/pagination"

/**
 * @description Maps a `todos` row to its model
 * @param row Row read from `todos`
 */
const toTodo = (row: typeof todos.$inferSelect): Todo => ({
    id: row.id,
    title: row.title,
    description: row.description,
    completed: row.isCompleted,
    endDate: row.endDate,
})

/**
 * @description Builds the `ilike` pattern matching the text anywhere in a column
 * @param text Text typed by the caller
 * @remarks Escapes `\`, `%` and `_`, so they match literally
 */
const toContainsPattern = (text: string): string =>
    `%${text.replaceAll(/[\\%_]/gu, match => `\\${match}`)}%`

export class TodoStorage {
    private readonly db: DbInstanceFromSchema
    public constructor(db: DbInstanceFromSchema) {
        this.db = db
    }

    /**
     * @description Persists one todo
     * @param todo Todo inserted, carrying its id
     */
    public async createTodo(todo: Todo): Promise<void> {
        await this.db.insert(todos).values({
            id: todo.id,
            title: todo.title,
            description: todo.description,
            isCompleted: todo.completed,
            endDate: todo.endDate,
        })
    }

    /**
     * @description Fetches every todo, unordered
     */
    public async getTodos(): Promise<Todo[]> {
        const result = await this.db.select().from(todos)
        return result.map(toTodo)
    }

    /**
     * @description Fetches one page of todos and the total count of matching rows
     * @param query Page, page size and completed filter
     * @remarks Reads the count and the page in one snapshot, so `total` matches the page
     */
    public async listTodosPaginated(
        query: TodoListQuery,
    ): Promise<{ items: Todo[]; total: number }> {
        const whereClause =
            query.completed === undefined
                ? undefined
                : eq(todos.isCompleted, query.completed)

        const { limit, offset } = toLimitOffset(query)

        return await this.db.transaction(
            async tx => {
                const [countResult] = await tx
                    .select({ value: count() })
                    .from(todos)
                    .where(whereClause)

                const rows = await tx
                    .select()
                    .from(todos)
                    .where(whereClause)
                    .orderBy(todos.id)
                    .limit(limit)
                    .offset(offset)

                return {
                    items: rows.map(toTodo),
                    total: countResult?.value ?? 0,
                }
            },
            { isolationLevel: "repeatable read", accessMode: "read only" },
        )
    }

    /**
     * @description Fetches every todo matching the search filters, unordered
     * @param search Title text, completion status and id list, each one optional
     * @remarks Matches the text anywhere in the title, ignoring case
     */
    public async searchTodos(search: TodoSearch): Promise<Todo[]> {
        const result = await this.db
            .select()
            .from(todos)
            .where(
                and(
                    search.completed === undefined
                        ? undefined
                        : eq(todos.isCompleted, search.completed),
                    search.text === undefined
                        ? undefined
                        : ilike(todos.title, toContainsPattern(search.text)),
                    search.ids === undefined ? undefined : inArray(todos.id, search.ids),
                ),
            )
        return result.map(toTodo)
    }

    /**
     * @description Fetches one todo, or `null` when no row matches
     * @param id Todo read
     */
    public async getTodo(id: string): Promise<Todo | null> {
        const result = await this.db.select().from(todos).where(eq(todos.id, id))

        const [row] = result
        if (!row) {
            return null
        }
        return toTodo(row)
    }

    /**
     * @description Persists the given fields of one todo, returning the updated todo
     * @param id Todo updated
     * @param fields Fields replaced, each one optional
     * @remarks Skips an `undefined` field and writes `null` for a `null` field
     */
    public async updateTodo(id: string, fields: TodoUpdate): Promise<Todo | null> {
        const result = await this.db
            .update(todos)
            .set({
                title: fields.title,
                description: fields.description,
                isCompleted: fields.completed,
                endDate: fields.endDate,
            })
            .where(eq(todos.id, id))
            .returning()

        const [row] = result
        if (!row) {
            return null
        }
        return toTodo(row)
    }

    /**
     * @description Deletes one todo, returning the deleted todo
     * @param id Todo deleted
     */
    public async deleteTodo(id: string): Promise<Todo | null> {
        const [row] = await this.db.delete(todos).where(eq(todos.id, id)).returning()
        return row ? toTodo(row) : null
    }
}
