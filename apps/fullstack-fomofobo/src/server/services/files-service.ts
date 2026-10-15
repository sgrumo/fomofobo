import "server-only"
import type { S3ObjectStorage } from "backend-shared"
import type {
    FileDownload,
    FileMetadata,
    PresignedUpload,
    UploadFinalize,
    UploadRequest,
} from "models"
import { MAX_UPLOAD_SIZE_BYTES, uploadContentTypeSchema } from "models"
import type { FilesStorage } from "storage"

import { appError } from "../errors"

const KEY_PREFIX = "files"

/**
 * @description Maps a file name to a key segment without path separators
 * @param name Client-supplied file name
 * @remarks Returns `file` when the cleaned name is empty
 */
const sanitizeFileName = (name: string): string => {
    const cleaned = name
        .replaceAll(/[/\\]/gu, "_")
        .replaceAll(/[^\w.\- ]/gu, "")
        .trim()
        .slice(0, 200)
    return cleaned.length > 0 ? cleaned : "file"
}

export class FilesService {
    private readonly filesStorage: FilesStorage
    private readonly objectStorage: S3ObjectStorage
    public constructor(filesStorage: FilesStorage, objectStorage: S3ObjectStorage) {
        this.filesStorage = filesStorage
        this.objectStorage = objectStorage
    }

    /**
     * @description Returns a presigned upload ticket for the declared file
     * @param request Declared file name and content type
     * @remarks Owns the destination key, so a client never picks where bytes land
     */
    public async requestUpload(request: UploadRequest): Promise<PresignedUpload> {
        const key = `${KEY_PREFIX}/${crypto.randomUUID()}/${sanitizeFileName(request.fileName)}`
        const { url, fields } = await this.objectStorage.createUploadPost(
            key,
            request.contentType,
            MAX_UPLOAD_SIZE_BYTES,
        )
        return { url, fields, key }
    }

    /**
     * @description Persists the metadata of an uploaded object after re-verifying it
     * @param finalize Object key and display name recorded
     * @throws When the key is outside the files namespace, or the object fails a check
     * @remarks Trusts nothing from the client, and deletes an object failing a check
     */
    public async finalize(finalize: UploadFinalize): Promise<FileMetadata> {
        if (!finalize.key.startsWith(`${KEY_PREFIX}/`)) {
            throw appError("InvalidRequest", "Object key is not in the files namespace")
        }

        const head = await this.objectStorage.headObject(finalize.key)
        if (!head) {
            throw appError("InvalidRequest", "Uploaded object not found")
        }

        // HeadObject is an external boundary, so its content-type is parsed, not trusted.
        const parsedType = uploadContentTypeSchema.safeParse(head.contentType)
        if (!parsedType.success) {
            await this.objectStorage.deleteObject(finalize.key).catch(() => undefined)
            throw appError(
                "InvalidRequest",
                "Uploaded object has a disallowed content type",
            )
        }
        if (head.sizeBytes <= 0 || head.sizeBytes > MAX_UPLOAD_SIZE_BYTES) {
            await this.objectStorage.deleteObject(finalize.key).catch(() => undefined)
            throw appError("InvalidRequest", "Uploaded object exceeds the size limit")
        }

        const file: FileMetadata = {
            id: crypto.randomUUID(),
            objectKey: finalize.key,
            fileName: finalize.fileName,
            contentType: parsedType.data,
            sizeBytes: head.sizeBytes,
            createdAt: new Date().toISOString(),
        }
        await this.filesStorage.create(file)
        return file
    }

    /**
     * @description Fetches the metadata of every registered file
     */
    public async list(): Promise<FileMetadata[]> {
        return await this.filesStorage.list()
    }

    /**
     * @description Returns a presigned download URL for the file
     * @param id File downloaded
     */
    public async getDownloadUrl(id: string): Promise<FileDownload> {
        const file = await this.requireFile(id)
        const url = await this.objectStorage.createDownloadUrl(file.objectKey)
        return { url }
    }

    /**
     * @description Deletes the object and its metadata row
     * @param id File deleted
     * @throws When no row matches the id
     * @remarks Removes the object best-effort after the row, so a failed object delete leaves an orphan object
     */
    public async delete(id: string): Promise<void> {
        const file = await this.filesStorage.delete(id)
        if (!file) {
            throw appError("ItemNotFound", `File with id ${id} not found`)
        }
        await this.objectStorage.deleteObject(file.objectKey).catch(() => undefined)
    }

    /**
     * @description Fetches the file metadata, or throws when no row matches the id
     * @param id File read
     */
    private async requireFile(id: string): Promise<FileMetadata> {
        const file = await this.filesStorage.getById(id)
        if (!file) {
            throw appError("ItemNotFound", `File with id ${id} not found`)
        }
        return file
    }
}
