import "server-only"
import type { Category, CategoryCreation, CategoryUpdate } from "models"
import type { CategoriesStorage } from "storage"

import { appError } from "../errors"

export class CategoriesService {
    private readonly categoriesStorage: CategoriesStorage
    public constructor(categoriesStorage: CategoriesStorage) {
        this.categoriesStorage = categoriesStorage
    }

    /**
     * @description Fetches every category, ordered by name
     */
    public async list(): Promise<Category[]> {
        return await this.categoriesStorage.list()
    }

    /**
     * @description Persists a new category
     * @param creation Name and icon of the category
     */
    public async create(creation: CategoryCreation): Promise<Category> {
        await this.assertNameFree(creation.name)
        const category = { id: crypto.randomUUID(), ...creation }
        await this.categoriesStorage.insert(category, new Date())
        return category
    }

    /**
     * @description Persists the changed fields of a category
     * @param id Category changed
     * @param fields Fields replaced
     */
    public async update(id: string, fields: CategoryUpdate): Promise<Category> {
        if (fields.name !== undefined) {
            await this.assertNameFree(fields.name, id)
        }
        const category = await this.categoriesStorage.update(id, fields)
        if (category === null) {
            throw appError("CategoryNotFound", `Category ${id} not found`)
        }
        return category
    }

    /**
     * @description Deletes a category that no event in place uses, with its links to deleted events
     * @param id Category deleted
     */
    public async delete(id: string): Promise<void> {
        // PLACEHOLDER(OP-24): a category in use stays
        if ((await this.categoriesStorage.countEventUses(id)) > 0) {
            throw appError("CategoryInUse", `An event uses the category ${id}`)
        }
        if ((await this.categoriesStorage.deleteWithDeletedEventLinks(id)) === null) {
            throw appError("CategoryNotFound", `Category ${id} not found`)
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
}
