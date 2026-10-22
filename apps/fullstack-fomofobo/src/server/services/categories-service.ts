import "server-only"
import type { S3ObjectStorage } from "backend-shared"
import type {
    Category,
    CategoryCreation,
    CategoryUpdate,
    PhotoUploadRequest,
    PresignedUpload,
} from "models"
import { unstable_cache } from "next/cache"
import type { CategoriesStorage, StoredCategory } from "storage"

import { CATEGORIES_TAG, expireTags, PUBLIC_TAG } from "../cache"
import { appError } from "../errors"
import type { PhotosService } from "./photos-service"
import {
    assertUploadedPhoto,
    categoryImageKeyPrefix,
    deleteReplacedObject,
    photoUrl,
} from "./photos-service"

export class CategoriesService {
    private readonly categoriesStorage: CategoriesStorage
    private readonly photos: PhotosService
    private readonly photoStorage: S3ObjectStorage
    private readonly photosPublicBaseUrl: string
    public constructor(
        categoriesStorage: CategoriesStorage,
        photos: PhotosService,
        photoStorage: S3ObjectStorage,
        photosPublicBaseUrl: string,
    ) {
        this.categoriesStorage = categoriesStorage
        this.photos = photos
        this.photoStorage = photoStorage
        this.photosPublicBaseUrl = photosPublicBaseUrl
    }

    /**
     * @description Fetches every category, ordered by name, from the cache of public reads
     */
    public async list(): Promise<Category[]> {
        return await unstable_cache(
            async () => {
                const categories = await this.categoriesStorage.list()
                return categories.map(category => this.toCategory(category))
            },
            ["categories-v2"],
            { tags: [CATEGORIES_TAG] },
        )()
    }

    /**
     * @description Persists a new category
     * @param creation Name and icon of the category
     */
    public async create(creation: CategoryCreation): Promise<Category> {
        await this.assertNameFree(creation.name)
        const category = { id: crypto.randomUUID(), ...creation }
        await this.categoriesStorage.insert(category, new Date())
        expireTags(CATEGORIES_TAG)
        return { ...category, imageUrl: null }
    }

    /**
     * @description Persists the changed fields of a category, with the key of an uploaded image
     * @param id Category changed
     * @param fields Fields replaced
     */
    public async update(id: string, fields: CategoryUpdate): Promise<Category> {
        if (fields.name !== undefined) {
            await this.assertNameFree(fields.name, id)
        }
        const current = await this.categoriesStorage.findById(id)
        if (current === null) {
            throw appError("CategoryNotFound", `Category ${id} not found`)
        }
        const { imageKey, ...rest } = fields
        if (
            imageKey !== undefined &&
            imageKey !== null &&
            imageKey !== current.imageObjectKey
        ) {
            await assertUploadedPhoto(
                this.photoStorage,
                imageKey,
                categoryImageKeyPrefix(id),
            )
        }
        const category = await this.categoriesStorage.update(id, {
            ...rest,
            imageObjectKey: imageKey,
        })
        if (category === null) {
            throw appError("CategoryNotFound", `Category ${id} not found`)
        }
        // The image stands in for the cover of the cached events of the category.
        expireTags(CATEGORIES_TAG, ...(imageKey === undefined ? [] : [PUBLIC_TAG]))

        if (
            imageKey !== undefined &&
            current.imageObjectKey !== null &&
            current.imageObjectKey !== imageKey
        ) {
            await deleteReplacedObject(
                this.photoStorage,
                current.imageObjectKey,
                "Category image",
            )
        }
        return this.toCategory(category)
    }

    /**
     * @description Builds a presigned PUT of an image under a new key of the category
     * @param id Category whose image is uploaded
     * @param request Content type and size of the image
     */
    public async createImageUploadTicket(
        id: string,
        request: PhotoUploadRequest,
    ): Promise<PresignedUpload> {
        if ((await this.categoriesStorage.findById(id)) === null) {
            throw appError("CategoryNotFound", `Category ${id} not found`)
        }
        return await this.photos.createTicketUnder(categoryImageKeyPrefix(id), request)
    }

    /**
     * @description Deletes a category that no event in place and no venue uses, with its links to deleted events
     * @param id Category deleted
     */
    public async delete(id: string): Promise<void> {
        // PLACEHOLDER(OP-24): a category in use stays
        if ((await this.categoriesStorage.countUses(id)) > 0) {
            throw appError("CategoryInUse", `An event or a venue uses the category ${id}`)
        }
        const deleted = await this.categoriesStorage.deleteWithDeletedEventLinks(id)
        if (deleted === null) {
            throw appError("CategoryNotFound", `Category ${id} not found`)
        }
        expireTags(CATEGORIES_TAG)
        if (deleted.imageObjectKey !== null) {
            await deleteReplacedObject(
                this.photoStorage,
                deleted.imageObjectKey,
                "Category image",
            )
        }
    }

    /**
     * @description Throws when another category holds the name
     * @param name Name checked
     * @param ownId Category that keeps the name, on an update
     */
    private async assertNameFree(name: string, ownId?: string): Promise<void> {
        const holder = await this.categoriesStorage.findByName(name)
        if (holder !== null && holder.id !== ownId) {
            throw appError("CategoryNameTaken", `Another category has the name ${name}`)
        }
    }

    /**
     * @description Maps a stored category to its model, with the public URL of its image
     * @param category Stored category
     */
    private toCategory(category: StoredCategory): Category {
        const { imageObjectKey, ...rest } = category
        return {
            ...rest,
            imageUrl:
                imageObjectKey === null
                    ? null
                    : photoUrl(this.photosPublicBaseUrl, imageObjectKey),
        }
    }
}
