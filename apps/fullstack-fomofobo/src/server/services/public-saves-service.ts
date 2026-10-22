import "server-only"
import type { OccurrenceRef } from "models"
import type { RateLimitsStorage, SavesStorage } from "storage"

import { appError } from "../errors"
import type { PublicOccurrencesService } from "./public-occurrences-service"
import { rateLimitClientOf } from "./rate-limit-client"

const SAVES_CALLS_PER_WINDOW = 60
const SAVES_WINDOW_MS = 10 * 60_000

export class PublicSavesService {
    private readonly savesStorage: SavesStorage
    private readonly rateLimitsStorage: RateLimitsStorage
    private readonly occurrences: PublicOccurrencesService
    public constructor(
        savesStorage: SavesStorage,
        rateLimitsStorage: RateLimitsStorage,
        occurrences: PublicOccurrencesService,
    ) {
        this.savesStorage = savesStorage
        this.rateLimitsStorage = rateLimitsStorage
        this.occurrences = occurrences
    }

    /**
     * @description Persists the save of a visible occurrence by a device, counted once per device
     * @param ref Event and local date, any date for a single event
     * @param deviceId Anonymous id of the device
     * @param forwardedFor `x-forwarded-for` header of the request
     * @param now Instant of the save
     */
    public async save(
        ref: OccurrenceRef,
        deviceId: string,
        forwardedFor: string | undefined,
        now: Date,
    ): Promise<void> {
        await this.assertUnderLimit(forwardedFor, now)
        const occurrence = await this.occurrences.get(ref, now)
        await this.savesStorage.add(
            { eventId: occurrence.eventId, date: occurrence.date },
            deviceId,
            now,
        )
    }

    /**
     * @description Deletes the save of an occurrence by a device, if any
     * @param ref Event and local date of the occurrence
     * @param deviceId Anonymous id of the device
     * @param forwardedFor `x-forwarded-for` header of the request
     * @param now Instant of the call
     */
    public async unsave(
        ref: OccurrenceRef,
        deviceId: string,
        forwardedFor: string | undefined,
        now: Date,
    ): Promise<void> {
        await this.assertUnderLimit(forwardedFor, now)
        await this.savesStorage.remove(ref, deviceId)
    }

    /**
     * @description Persists one save call of the client, and throws past the limit of the window
     * @param forwardedFor `x-forwarded-for` header of the request
     * @param now Instant of the call
     * @throws When the client made too many save calls in the window
     */
    private async assertUnderLimit(
        forwardedFor: string | undefined,
        now: Date,
    ): Promise<void> {
        const calls = await this.rateLimitsStorage.hit(
            `saves:${rateLimitClientOf(forwardedFor)}`,
            now,
            SAVES_WINDOW_MS,
        )
        if (calls > SAVES_CALLS_PER_WINDOW) {
            throw appError("TooManyRequests", "Too many save calls from this client")
        }
    }
}
