import { logger, S3ObjectStorage } from "backend-shared"
import { DEFAULT_ENDED_VISIBLE_DAYS } from "models"
import { buildDbInstance, EventsStorage, SettingsStorage } from "storage"

import { parseEnv } from "./env"
import { purgeEndedEventPhotos } from "./purge-photos"

/**
 * @description Purges the photos of the ended events from the database and the bucket of the environment
 * @throws When the environment is invalid, or a row delete fails
 */
const main = async (): Promise<void> => {
    const env = parseEnv(process.env)
    const db = buildDbInstance({
        url: env.DATABASE_URL,
        authToken: env.DATABASE_AUTH_TOKEN,
    })
    const eventsStorage = new EventsStorage(db)
    const settings = await new SettingsStorage(db).get()
    const photoStorage = new S3ObjectStorage({
        bucket: env.S3_BUCKET,
        region: env.S3_REGION,
        endpoint: env.S3_ENDPOINT,
        accessKeyId: env.S3_ACCESS_KEY,
        secretAccessKey: env.S3_SECRET_KEY,
    })

    const result = await purgeEndedEventPhotos(
        {
            deletePhotosOfEndedEvents: async (endedBefore, limit) =>
                await eventsStorage.deletePhotosOfEndedEvents(endedBefore, limit),
            deleteObject: async key => {
                await photoStorage.deleteObject(key)
            },
        },
        new Date(),
        settings?.endedVisibleDays ?? DEFAULT_ENDED_VISIBLE_DAYS,
    )
    logger.info("Photos of the ended events purged", {
        deletedCount: result.deletedCount,
    })
    if (result.failedKeys.length > 0) {
        logger.error("Photo objects not deleted, delete them by hand", {
            keys: result.failedKeys,
        })
        process.exitCode = 1
    }
}

main().catch((error: unknown) => {
    logger.error("Photo purge failed", {
        error: error instanceof Error ? error.message : String(error),
    })
    process.exitCode = 1
})
