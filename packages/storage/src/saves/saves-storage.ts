import { and, count, eq, gt } from "drizzle-orm"
import type { OccurrenceRef } from "models"

import type { DbInstanceFromSchema } from "../db-config"
import { eventOccurrences, occurrenceSaves } from "../db-schema"

export class SavesStorage {
    private readonly db: DbInstanceFromSchema
    public constructor(db: DbInstanceFromSchema) {
        this.db = db
    }

    /**
     * @description Persists the save of an occurrence by a device; a second save of the same device changes nothing
     * @param ref Event and local date of the occurrence
     * @param deviceId Anonymous id of the device
     * @param at Instant of the save
     */
    public async add(ref: OccurrenceRef, deviceId: string, at: Date): Promise<void> {
        await this.db
            .insert(occurrenceSaves)
            .values({
                eventId: ref.eventId,
                localDate: ref.date,
                deviceId,
                createdAt: at,
            })
            .onConflictDoNothing()
    }

    /**
     * @description Deletes the save of an occurrence by a device, if any
     * @param ref Event and local date of the occurrence
     * @param deviceId Anonymous id of the device
     */
    public async remove(ref: OccurrenceRef, deviceId: string): Promise<void> {
        await this.db
            .delete(occurrenceSaves)
            .where(
                and(
                    eq(occurrenceSaves.eventId, ref.eventId),
                    eq(occurrenceSaves.localDate, ref.date),
                    eq(occurrenceSaves.deviceId, deviceId),
                ),
            )
    }

    /**
     * @description Fetches the occurrences of an event that end after an instant, by start, each with the count of its saves
     * @param eventId Event read
     * @param endsAfter Instant each occurrence ends after
     */
    public async listOccurrenceCounts(
        eventId: string,
        endsAfter: Date,
    ): Promise<Array<{ localDate: string; startsAt: Date; count: number }>> {
        return await this.db
            .select({
                localDate: eventOccurrences.localDate,
                startsAt: eventOccurrences.startsAt,
                count: count(occurrenceSaves.deviceId),
            })
            .from(eventOccurrences)
            .leftJoin(
                occurrenceSaves,
                and(
                    eq(occurrenceSaves.eventId, eventOccurrences.eventId),
                    eq(occurrenceSaves.localDate, eventOccurrences.localDate),
                ),
            )
            .where(
                and(
                    eq(eventOccurrences.eventId, eventId),
                    gt(eventOccurrences.endsAt, endsAfter),
                ),
            )
            .groupBy(eventOccurrences.localDate, eventOccurrences.startsAt)
            .orderBy(eventOccurrences.startsAt)
    }

    /**
     * @description Fetches the count of the saves of one occurrence
     * @param ref Event and local date of the occurrence
     */
    public async countFor(ref: OccurrenceRef): Promise<number> {
        const [row] = await this.db
            .select({ value: count() })
            .from(occurrenceSaves)
            .where(
                and(
                    eq(occurrenceSaves.eventId, ref.eventId),
                    eq(occurrenceSaves.localDate, ref.date),
                ),
            )
        return row?.value ?? 0
    }
}
