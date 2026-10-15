import {
    bigint,
    boolean,
    date,
    pgEnum,
    pgTable,
    text,
    timestamp,
    uuid,
} from "drizzle-orm/pg-core"
import { todoPriorityValues } from "models"

export const todoPriorityEnum = pgEnum("todo_priority", todoPriorityValues)

export const todos = pgTable("todos", {
    id: uuid("id").primaryKey(),
    title: text("title").notNull(),
    description: text("description"),
    isCompleted: boolean("is_completed").notNull().default(false),
    endDate: date("end_date", { mode: "string" }),
    priority: todoPriorityEnum("priority"),
})

/**
 * @remarks Holds the object key, never a URL, because the bytes live in object storage
 */
export const files = pgTable("files", {
    id: uuid("id").primaryKey(),
    objectKey: text("object_key").notNull().unique(),
    fileName: text("file_name").notNull(),
    contentType: text("content_type").notNull(),
    sizeBytes: bigint("size_bytes", { mode: "number" }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})
