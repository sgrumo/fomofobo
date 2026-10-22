import { eq } from "drizzle-orm"
import {
    deleteAllRows,
    eventCategories,
    eventOccurrences,
    eventPhotos,
    events,
    platformSettings,
} from "storage"
import { beforeEach, describe, expect, it } from "vitest"

import { daysFromNow, photoStorage, runPurge, seedEventWithPhotos, testDb } from "./utils"

describe("photo-purge", () => {
    beforeEach(async () => {
        await deleteAllRows(testDb)
    })

    it("deletes the photos of an event ended over three days ago and keeps the rest of the event", async () => {
        const ended = await seedEventWithPhotos([daysFromNow(-10), daysFromNow(-4)])

        runPurge()

        const [photoRows, eventRows, occurrenceRows, categoryRows, heads] =
            await Promise.all([
                testDb
                    .select()
                    .from(eventPhotos)
                    .where(eq(eventPhotos.eventId, ended.eventId)),
                testDb.select().from(events).where(eq(events.id, ended.eventId)),
                testDb
                    .select()
                    .from(eventOccurrences)
                    .where(eq(eventOccurrences.eventId, ended.eventId)),
                testDb
                    .select()
                    .from(eventCategories)
                    .where(eq(eventCategories.eventId, ended.eventId)),
                Promise.all(ended.photoKeys.map(key => photoStorage.headObject(key))),
            ])
        expect(photoRows).toStrictEqual([])
        expect(heads).toStrictEqual([null, null])
        expect(eventRows).toHaveLength(1)
        expect(occurrenceRows).toHaveLength(2)
        expect(categoryRows).toHaveLength(1)
    })

    it("keeps the photos of an event ended under three days ago and of an event with an occurrence to come", async () => {
        const recent = await seedEventWithPhotos([daysFromNow(-2)])
        const repeating = await seedEventWithPhotos([daysFromNow(-30), daysFromNow(5)])
        const ended = await seedEventWithPhotos([daysFromNow(-5)])

        runPurge()

        const photoRows = await testDb
            .select({ objectKey: eventPhotos.objectKey })
            .from(eventPhotos)
            .orderBy(eventPhotos.objectKey)
        const keptKeys = [...recent.photoKeys, ...repeating.photoKeys]
        expect(photoRows.map(row => row.objectKey)).toStrictEqual(keptKeys.toSorted())
        const heads = await Promise.all(
            [...keptKeys, ...ended.photoKeys].map(key => photoStorage.headObject(key)),
        )
        expect(heads.map(head => head !== null)).toStrictEqual([
            true,
            true,
            true,
            true,
            false,
            false,
        ])
    })

    it("follows the retention days an Admin saved", async () => {
        await testDb.insert(platformSettings).values({
            id: 1,
            endedVisibleDays: 10,
            participantThreshold: 20,
            updatedAt: new Date(),
        })
        const kept = await seedEventWithPhotos([daysFromNow(-5)])
        const purged = await seedEventWithPhotos([daysFromNow(-12)])

        runPurge()

        const photoRows = await testDb
            .select({ objectKey: eventPhotos.objectKey })
            .from(eventPhotos)
            .orderBy(eventPhotos.objectKey)
        expect(photoRows.map(row => row.objectKey)).toStrictEqual(
            kept.photoKeys.toSorted(),
        )
        const heads = await Promise.all(
            purged.photoKeys.map(key => photoStorage.headObject(key)),
        )
        expect(heads).toStrictEqual([null, null])
    })
})
