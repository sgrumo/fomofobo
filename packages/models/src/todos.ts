import { z } from "@hono/zod-openapi"

import { paginatedResponseSchema, paginationQuerySchema } from "./lib/pagination"
import { nonEmptyUpdate } from "./lib/updates"

export const todoPriorityValues = ["low", "medium", "high"] as const
export const todoPrioritySchema = z.enum(todoPriorityValues)
export type TodoPriority = z.infer<typeof todoPrioritySchema>

export const todoSchema = z.object({
    id: z.uuid(),
    title: z.string(),
    description: z.string().nullable(),
    completed: z.boolean(),
    endDate: z.iso.date().nullable(),
})
export type Todo = z.infer<typeof todoSchema>

export const todoCreationSchema = z.object({
    title: z.string().min(1),
    description: z.string().min(1).optional(),
    endDate: z.iso.date().optional(),
})
export type TodoCreation = z.infer<typeof todoCreationSchema>

export const todoUpdateSchema = nonEmptyUpdate(
    z.object({
        title: z.string().min(1).optional(),
        description: z.string().min(1).nullable().optional(),
        completed: z.boolean().optional(),
        endDate: z.iso.date().nullable().optional(),
    }),
)
export type TodoUpdate = z.infer<typeof todoUpdateSchema>

export const todoListSchema = z.array(todoSchema)
export type TodoList = z.infer<typeof todoListSchema>

export const todoListQuerySchema = paginationQuerySchema.extend({
    completed: z.stringbool().optional(),
})
export type TodoListQuery = z.infer<typeof todoListQuerySchema>

export const todoSearchSchema = z.object({
    text: z.string().min(1).optional(),
    completed: z.boolean().optional(),
    ids: z.array(z.uuid()).min(1).optional(),
})
export type TodoSearch = z.infer<typeof todoSearchSchema>

export const paginatedTodoListSchema = paginatedResponseSchema(todoSchema)
export type PaginatedTodoList = z.infer<typeof paginatedTodoListSchema>
