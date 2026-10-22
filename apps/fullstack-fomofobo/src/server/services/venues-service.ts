import "server-only"
import type { S3ObjectStorage } from "backend-shared"
import { logger } from "backend-shared"
import type {
    Account,
    PhotoUploadRequest,
    PresignedUpload,
    Venue,
    VenueCreation,
    VenueListQuery,
    VenueUpdate,
} from "models"
import type { AccountsStorage, StoredVenue, VenuesStorage } from "storage"

import { expireTags, PUBLIC_TAG, venueTag } from "../cache"
import { appError } from "../errors"
import type { PhotosService } from "./photos-service"
import { assertUploadedPhoto, photoUrl, venueCoverKeyPrefix } from "./photos-service"
import type { Page } from "./to-page"
import { toPage } from "./to-page"

export class VenuesService {
    private readonly venuesStorage: VenuesStorage
    private readonly accountsStorage: AccountsStorage
    private readonly photos: PhotosService
    private readonly photoStorage: S3ObjectStorage
    private readonly photosPublicBaseUrl: string
    public constructor(
        venuesStorage: VenuesStorage,
        accountsStorage: AccountsStorage,
        photos: PhotosService,
        photoStorage: S3ObjectStorage,
        photosPublicBaseUrl: string,
    ) {
        this.venuesStorage = venuesStorage
        this.accountsStorage = accountsStorage
        this.photos = photos
        this.photoStorage = photoStorage
        this.photosPublicBaseUrl = photosPublicBaseUrl
    }

    /**
     * @description Fetches one page of the venues with their owner, ordered by name
     * @param query Page, text searched in name and address, and blocked state
     */
    public async list(query: VenueListQuery): Promise<Page<Venue>> {
        const page = await this.venuesStorage.list(query)
        return toPage(
            { items: page.items.map(venue => this.toVenue(venue)), total: page.total },
            query,
        )
    }

    /**
     * @description Fetches one venue with its owner
     * @param id Venue read
     */
    public async getById(id: string): Promise<Venue> {
        return this.toVenue(await this.findStored(id))
    }

    /**
     * @description Persists a new venue: an Organizer owns the one it creates, an Admin's has no owner
     * @param creation Name, address and coordinates of the venue
     * @param account Account of the session
     */
    public async create(creation: VenueCreation, account: Account): Promise<Venue> {
        const id = crypto.randomUUID()
        const inserted = await this.venuesStorage.insert(
            { id, ...creation },
            {
                createdBy: account.id,
                ownerId: account.role === "organizer" ? account.id : null,
            },
            new Date(),
        )
        if (!inserted) {
            throw appError(
                "VenueLimitReached",
                `Account ${account.id} already owns a venue`,
            )
        }
        return await this.getById(id)
    }

    /**
     * @description Persists the changed fields of a venue: an Admin edits any venue, an Organizer the one it owns
     * @param id Venue changed
     * @param fields Fields replaced, with the key of an uploaded cover
     * @param account Account of the session
     */
    public async update(
        id: string,
        fields: VenueUpdate,
        account: Account,
    ): Promise<Venue> {
        const current = await this.findEditable(id, account)
        const { coverPhotoKey, ...rest } = fields
        if (
            coverPhotoKey !== undefined &&
            coverPhotoKey !== null &&
            coverPhotoKey !== current.coverObjectKey
        ) {
            await assertUploadedPhoto(
                this.photoStorage,
                coverPhotoKey,
                venueCoverKeyPrefix(id),
            )
        }
        const written = await this.venuesStorage.update(
            id,
            { ...rest, coverObjectKey: coverPhotoKey },
            new Date(),
            account.role === "organizer" ? account.id : undefined,
        )
        if (!written) {
            throw appError("ForbiddenAction", `Venue ${id} changed owner meanwhile`)
        }
        expireTags(PUBLIC_TAG, venueTag(id))

        if (
            coverPhotoKey !== undefined &&
            current.coverObjectKey !== null &&
            current.coverObjectKey !== coverPhotoKey
        ) {
            await this.deleteCover(current.coverObjectKey)
        }
        return await this.getById(id)
    }

    /**
     * @description Builds a presigned PUT of a cover under a new key of the venue, for an account that may edit it
     * @param id Venue whose cover is uploaded
     * @param request Content type and size of the cover
     * @param account Account of the session
     */
    public async createCoverUploadTicket(
        id: string,
        request: PhotoUploadRequest,
        account: Account,
    ): Promise<PresignedUpload> {
        await this.findEditable(id, account)
        return await this.photos.createTicketUnder(venueCoverKeyPrefix(id), request)
    }

    /**
     * @description Persists the owner of a venue, an Organizer that owns no other venue, or none
     * @param id Venue changed
     * @param ownerId New owner, `null` for no owner
     */
    public async setOwner(id: string, ownerId: string | null): Promise<Venue> {
        if (ownerId !== null) {
            const owner = await this.accountsStorage.findById(ownerId)
            if (owner?.role !== "organizer") {
                throw appError("InvalidVenueOwner", `Organizer ${ownerId} not found`)
            }
            const owned = await this.venuesStorage.findOwnedBy(ownerId)
            if (owned !== null && owned !== id) {
                throw appError(
                    "VenueOwnerTaken",
                    `Organizer ${ownerId} owns another venue`,
                )
            }
        }
        if (!(await this.venuesStorage.setOwner(id, ownerId, new Date()))) {
            throw appError("VenueNotFound", `Venue ${id} not found`)
        }
        return await this.getById(id)
    }

    /**
     * @description Persists the block state of a venue; its events keep theirs
     * @param id Venue changed
     * @param block Block state, and the reason of a block
     */
    public async setBlocked(
        id: string,
        block: { isBlocked: boolean; blockReason: string | null },
    ): Promise<Venue> {
        if (!(await this.venuesStorage.setBlocked(id, block, new Date()))) {
            throw appError("VenueNotFound", `Venue ${id} not found`)
        }
        expireTags(PUBLIC_TAG, venueTag(id))
        return await this.getById(id)
    }

    /**
     * @description Fetches the stored venue, or throws when no row matches
     * @param id Venue read
     */
    private async findStored(id: string): Promise<StoredVenue> {
        const venue = await this.venuesStorage.findById(id)
        if (venue === null) {
            throw appError("VenueNotFound", `Venue ${id} not found`)
        }
        return venue
    }

    /**
     * @description Fetches the stored venue, or throws when the account may not edit it
     * @param id Venue read
     * @param account Account of the session
     */
    private async findEditable(id: string, account: Account): Promise<StoredVenue> {
        const venue = await this.findStored(id)
        if (account.role === "organizer" && venue.owner?.id !== account.id) {
            throw appError(
                "ForbiddenAction",
                `Account ${account.id} does not own venue ${id}`,
            )
        }
        return venue
    }

    /**
     * @description Deletes a replaced cover from the bucket, and logs a failure
     * @param key Cover key deleted
     * @remarks Belongs after the database write: a failure then leaves an unused object
     */
    private async deleteCover(key: string): Promise<void> {
        try {
            await this.photoStorage.deleteObject(key)
        } catch (error) {
            logger.error("Venue cover not deleted", {
                key,
                error: error instanceof Error ? error.message : String(error),
            })
        }
    }

    /**
     * @description Maps a stored venue to its model, with the public URL of its cover
     * @param venue Stored venue
     */
    private toVenue(venue: StoredVenue): Venue {
        const { coverObjectKey, ...rest } = venue
        return {
            ...rest,
            coverPhotoUrl:
                coverObjectKey === null
                    ? null
                    : photoUrl(this.photosPublicBaseUrl, coverObjectKey),
        }
    }
}
