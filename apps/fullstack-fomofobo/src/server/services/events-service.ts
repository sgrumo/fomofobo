import "server-only"
import type { S3ObjectStorage } from "backend-shared"
import { logger } from "backend-shared"
import type { Account, Event, EventListItem, EventListQuery, EventUpsert } from "models"
import type { EventsStorage, StoredEvent } from "storage"

import { expandOccurrences } from "@/lib/events/expand-occurrences"
import { PLATFORM_TIME_ZONE } from "@/lib/platform/platform"

import { eventTag, expireTags } from "../cache"
import { appError } from "../errors"
import { assertUploadedPhoto, photoKeyPrefix, photoUrl } from "./photos-service"
import type { Page } from "./to-page"
import { toPage } from "./to-page"

/**
 * @description Returns the organizer of a write: the Organizer itself, or the one an Admin picks
 * @param upsert Fields of the event
 * @param account Account of the session
 * @param current Event replaced, `null` on a creation
 */
const organizerOf = (
    upsert: EventUpsert,
    account: Account,
    current: StoredEvent | null,
): string => {
    if (account.role === "organizer") {
        if (upsert.organizerId !== undefined) {
            throw appError("ForbiddenAction", "An Organizer cannot pick the organizer")
        }
        return account.id
    }
    // PLACEHOLDER(OP-21, TQ-18): an Admin picks an Organizer account
    const organizerId = upsert.organizerId ?? current?.organizer.id
    if (organizerId === undefined) {
        throw appError("InvalidEventReference", "An Admin must pick the organizer")
    }
    return organizerId
}

export class EventsService {
    private readonly eventsStorage: EventsStorage
    private readonly photoStorage: S3ObjectStorage
    private readonly photosPublicBaseUrl: string
    public constructor(
        eventsStorage: EventsStorage,
        photoStorage: S3ObjectStorage,
        photosPublicBaseUrl: string,
    ) {
        this.eventsStorage = eventsStorage
        this.photoStorage = photoStorage
        this.photosPublicBaseUrl = photosPublicBaseUrl
    }

    /**
     * @description Fetches one page of the events, latest start first: the own events of an Organizer, every event for an Admin
     * @param query Page and filters, `organizerId` read for an Admin alone
     * @param account Account of the session
     */
    public async list(
        query: EventListQuery,
        account: Account,
    ): Promise<Page<EventListItem>> {
        const scoped =
            account.role === "organizer" ? { ...query, organizerId: account.id } : query
        return toPage(await this.eventsStorage.list(scoped), query)
    }

    /**
     * @description Fetches one event that the account sees
     * @param id Event read
     * @param account Account of the session
     */
    public async getById(id: string, account: Account): Promise<Event> {
        return this.toEvent(await this.findVisibleTo(id, account))
    }

    /**
     * @description Persists a new event with its categories, photos and occurrences
     * @param upsert Fields of the event
     * @param account Account of the session
     */
    public async create(upsert: EventUpsert, account: Account): Promise<Event> {
        const id = crypto.randomUUID()
        await this.write(id, upsert, organizerOf(upsert, account, null), account, null)
        return await this.getById(id, account)
    }

    /**
     * @description Persists every field of an event that the account sees, and replaces its children
     * @param id Event replaced
     * @param upsert Fields of the event
     * @param account Account of the session
     */
    public async update(
        id: string,
        upsert: EventUpsert,
        account: Account,
    ): Promise<Event> {
        const current = await this.findVisibleTo(id, account)
        await this.write(
            id,
            upsert,
            organizerOf(upsert, account, current),
            account,
            current,
        )
        return await this.getById(id, account)
    }

    /**
     * @description Persists the deletion of an event that the account sees, then deletes its photos from the bucket
     * @param id Event deleted
     * @param account Account of the session
     */
    public async delete(id: string, account: Account): Promise<void> {
        const current = await this.findVisibleTo(id, account)
        // PLACEHOLDER(OP-23): soft delete
        if (!(await this.eventsStorage.softDelete(id, new Date()))) {
            throw appError("EventNotFound", `Event ${id} not found`)
        }
        expireTags(eventTag(id))
        await this.deletePhotoObjects(current.photos.map(photo => photo.objectKey))
    }

    /**
     * @description Persists the block state of any event
     * @param id Event changed
     * @param block Block state, and the reason of a block
     * @param account Account of the session, an Admin
     */
    public async setBlocked(
        id: string,
        block: { isBlocked: boolean; blockReason: string | null },
        account: Account,
    ): Promise<Event> {
        if (!(await this.eventsStorage.setBlocked(id, block, new Date()))) {
            throw appError("EventNotFound", `Event ${id} not found`)
        }
        expireTags(eventTag(id))
        return await this.getById(id, account)
    }

    /**
     * @description Fetches one event, or throws when it is deleted, unknown, or owned by another Organizer
     * @param id Event read
     * @param account Account of the session
     */
    private async findVisibleTo(id: string, account: Account): Promise<StoredEvent> {
        const event = await this.eventsStorage.findById(id)
        if (
            event === null ||
            (account.role === "organizer" && event.organizer.id !== account.id)
        ) {
            throw appError("EventNotFound", `Event ${id} not found`)
        }
        return event
    }

    /**
     * @description Checks every reference and photo of a write, expands its occurrences, and persists it
     * @param id Event written
     * @param upsert Fields of the event
     * @param organizerId Organizer of the event
     * @param account Account of the session, which owns the new photo keys
     * @param current Event replaced, `null` on a creation
     */
    private async write(
        id: string,
        upsert: EventUpsert,
        organizerId: string,
        account: Account,
        current: StoredEvent | null,
    ): Promise<void> {
        if (new Set(upsert.photoKeys).size !== upsert.photoKeys.length) {
            throw appError("InvalidPhotoUpload", "A photo is listed twice")
        }
        const currentPhotoIds = new Map(
            current?.photos.map(photo => [photo.objectKey, photo.id]),
        )
        const newKeys = upsert.photoKeys.filter(key => !currentPhotoIds.has(key))
        await Promise.all(
            newKeys.map(async key => {
                await assertUploadedPhoto(
                    this.photoStorage,
                    key,
                    photoKeyPrefix(account.id),
                )
            }),
        )

        const refs = await this.eventsStorage.findWriteReferences({
            venueId: upsert.venueId,
            categoryIds: upsert.categoryIds,
            organizerId,
            photoKeys: newKeys,
        })
        if (!refs.venueExists) {
            throw appError("InvalidEventReference", `Venue ${upsert.venueId} not found`)
        }
        // An event already at a blocked venue keeps it
        if (refs.venueBlocked && current?.venue.id !== upsert.venueId) {
            throw appError("InvalidEventReference", `Venue ${upsert.venueId} is blocked`)
        }
        const missingCategoryId = upsert.categoryIds.find(
            categoryId => !refs.categoryIds.includes(categoryId),
        )
        if (missingCategoryId !== undefined) {
            throw appError(
                "InvalidEventReference",
                `Category ${missingCategoryId} not found`,
            )
        }
        if (refs.organizerRole !== "organizer") {
            throw appError("InvalidEventReference", `Organizer ${organizerId} not found`)
        }
        if (refs.photoKeyTaken) {
            throw appError("InvalidPhotoUpload", "A photo belongs to another event")
        }

        const occurrences = expandOccurrences(upsert, PLATFORM_TIME_ZONE)
        if (!occurrences.success) {
            throw appError(
                "TooManyOccurrences",
                "The recurrence yields too many occurrences",
            )
        }

        const write = {
            id,
            organizerId,
            venueId: upsert.venueId,
            title: upsert.title,
            description: upsert.description,
            startsAt: upsert.startsAt,
            endsAt: upsert.endsAt,
            recurrence: upsert.recurrence,
            instagramUrl: upsert.externalLinks.instagramUrl,
            facebookUrl: upsert.externalLinks.facebookUrl,
            priceScheme: upsert.priceScheme,
            capacity: upsert.capacity,
            categoryIds: upsert.categoryIds,
            primaryCategoryId: upsert.primaryCategoryId,
            photos: upsert.photoKeys.map((objectKey, position) => ({
                id: currentPhotoIds.get(objectKey) ?? crypto.randomUUID(),
                objectKey,
                position,
            })),
            occurrences: occurrences.value,
        }
        await (current === null
            ? this.eventsStorage.insertWithChildren(write, new Date())
            : this.eventsStorage.updateWithChildren(write, new Date()))
        expireTags(eventTag(id))

        const keptKeys = new Set(upsert.photoKeys)
        await this.deletePhotoObjects(
            [...currentPhotoIds.keys()].filter(key => !keptKeys.has(key)),
        )
    }

    /**
     * @description Deletes the objects from the bucket, and logs each failure
     * @param keys Photo keys deleted
     * @remarks Belongs after the database write: a failure then leaves an unused object, never a row without its photo
     */
    private async deletePhotoObjects(keys: string[]): Promise<void> {
        const results = await Promise.allSettled(
            keys.map(async key => {
                await this.photoStorage.deleteObject(key)
            }),
        )
        for (const [index, result] of results.entries()) {
            if (result.status === "rejected") {
                logger.warn("Photo object not deleted", {
                    key: keys[index],
                    error: result.reason,
                })
            }
        }
    }

    /**
     * @description Maps a stored event to its response, with the key and the public URL of each photo
     * @param event Stored event
     */
    private toEvent(event: StoredEvent): Event {
        return {
            ...event,
            photos: event.photos.map(photo => ({
                id: photo.id,
                url: photoUrl(this.photosPublicBaseUrl, photo.objectKey),
                position: photo.position,
                key: photo.objectKey,
            })),
        }
    }
}
