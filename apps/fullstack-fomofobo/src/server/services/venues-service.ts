import "server-only"
import type { Venue, VenueCreation, VenueListQuery, VenueUpdate } from "models"
import type { VenuesStorage } from "storage"

import { expireTags, PUBLIC_TAG } from "../cache"
import { appError } from "../errors"
import type { Page } from "./to-page"
import { toPage } from "./to-page"

export class VenuesService {
    private readonly venuesStorage: VenuesStorage
    public constructor(venuesStorage: VenuesStorage) {
        this.venuesStorage = venuesStorage
    }

    /**
     * @description Fetches one page of the venues, ordered by name
     * @param query Page and text searched in name and address
     */
    public async list(query: VenueListQuery): Promise<Page<Venue>> {
        return toPage(await this.venuesStorage.list(query), query)
    }

    /**
     * @description Fetches one venue
     * @param id Venue read
     */
    public async getById(id: string): Promise<Venue> {
        const venue = await this.venuesStorage.findById(id)
        if (venue === null) {
            throw appError("VenueNotFound", `Venue ${id} not found`)
        }
        return venue
    }

    /**
     * @description Persists a new venue
     * @param creation Name, address and coordinates of the venue
     * @param accountId Account that creates it
     */
    public async create(creation: VenueCreation, accountId: string): Promise<Venue> {
        const venue = { id: crypto.randomUUID(), ...creation }
        await this.venuesStorage.insert(venue, accountId, new Date())
        return venue
    }

    /**
     * @description Persists the changed fields of a venue
     * @param id Venue changed
     * @param fields Fields replaced
     */
    public async update(id: string, fields: VenueUpdate): Promise<Venue> {
        const venue = await this.venuesStorage.update(id, fields, new Date())
        if (venue === null) {
            throw appError("VenueNotFound", `Venue ${id} not found`)
        }
        expireTags(PUBLIC_TAG)
        return venue
    }
}
