import { desc, eq } from "drizzle-orm"
import type { FileMetadata } from "models"

import type { DbInstanceFromSchema } from "../db-config"
import { files } from "../db-schema"

/**
 * @description Maps a `files` row to its metadata model
 * @param row Row read from `files`
 */
const toFileMetadata = (row: typeof files.$inferSelect): FileMetadata => ({
    id: row.id,
    objectKey: row.objectKey,
    fileName: row.fileName,
    contentType: row.contentType,
    sizeBytes: row.sizeBytes,
    createdAt: row.createdAt.toISOString(),
})

export class FilesStorage {
    private readonly db: DbInstanceFromSchema
    public constructor(db: DbInstanceFromSchema) {
        this.db = db
    }

    /**
     * @description Persists the metadata of one file
     * @param file Metadata inserted, carrying its id
     */
    public async create(file: FileMetadata): Promise<void> {
        await this.db.insert(files).values({
            id: file.id,
            objectKey: file.objectKey,
            fileName: file.fileName,
            contentType: file.contentType,
            sizeBytes: file.sizeBytes,
            createdAt: new Date(file.createdAt),
        })
    }

    /**
     * @description Fetches the metadata of every file, newest first
     */
    public async list(): Promise<FileMetadata[]> {
        const rows = await this.db.select().from(files).orderBy(desc(files.createdAt))
        return rows.map(toFileMetadata)
    }

    /**
     * @description Fetches the metadata of one file, or `null` when no row matches
     * @param id File read
     */
    public async getById(id: string): Promise<FileMetadata | null> {
        const [row] = await this.db.select().from(files).where(eq(files.id, id))
        return row ? toFileMetadata(row) : null
    }

    /**
     * @description Deletes the metadata row of one file, returning the deleted metadata
     * @param id File deleted
     */
    public async delete(id: string): Promise<FileMetadata | null> {
        const [row] = await this.db.delete(files).where(eq(files.id, id)).returning()
        return row ? toFileMetadata(row) : null
    }
}
