import { parseArgs } from "node:util"

import { S3ObjectStorage } from "backend-shared"
import { buildDbInstance, EventsStorage } from "storage"

import { ditherPhoto, isDitheredPng } from "./dither-photo"
import { parseEnv } from "./env"

const USAGE = `Usage:
  DATABASE_URL=<url> S3_BUCKET=<bucket> S3_ENDPOINT=<url> S3_ACCESS_KEY=<key> S3_SECRET_KEY=<secret> \\
    pnpm dither-photos [--dry-run]

Replaces every stored event photo with its dithered PNG, under a new key, and deletes the
original. A photo already dithered stays as it is, so a second run changes nothing.
--dry-run reads and dithers every photo but writes nothing.`

type PhotoOutcome = "dithered" | "skipped" | "changed-meanwhile"

/**
 * @description Fetches the bytes of an object through a presigned GET
 * @param photoStorage Bucket of the environment
 * @param key Object key read
 * @throws When the object does not answer `200`
 */
const download = async (
    photoStorage: S3ObjectStorage,
    key: string,
): Promise<Uint8Array> => {
    const response = await fetch(await photoStorage.createDownloadUrl(key))
    if (!response.ok) {
        throw new Error(`GET ${key} answered ${String(response.status)}`)
    }
    return new Uint8Array(await response.arrayBuffer())
}

/**
 * @description Persists the PNG under a new object key through a presigned PUT
 * @param photoStorage Bucket of the environment
 * @param key Object key written
 * @param png Bytes uploaded
 * @throws When the upload does not answer `2xx`
 */
const upload = async (
    photoStorage: S3ObjectStorage,
    key: string,
    png: Uint8Array<ArrayBuffer>,
): Promise<void> => {
    const ticket = await photoStorage.createUploadUrl(key, "image/png", png.byteLength)
    const response = await fetch(ticket.url, {
        method: "PUT",
        headers: ticket.headers,
        body: png,
    })
    if (!response.ok) {
        throw new Error(`PUT ${key} answered ${String(response.status)}`)
    }
}

/**
 * @description Replaces one photo with its dithered copy: the new object, then the row, then the old object
 * @param dependencies Rows and bucket of the environment
 * @param photo Row id and object key of the photo
 * @param dryRun True to read and dither with no write
 * @remarks Deletes the new object when another writer changed the row in between, so the bucket keeps no orphan
 */
const ditherStoredPhoto = async (
    dependencies: { eventsStorage: EventsStorage; photoStorage: S3ObjectStorage },
    photo: { id: string; objectKey: string },
    dryRun: boolean,
): Promise<PhotoOutcome> => {
    const original = await download(dependencies.photoStorage, photo.objectKey)
    if (isDitheredPng(original)) {
        return "skipped"
    }
    const png = await ditherPhoto(original)
    if (dryRun) {
        return "dithered"
    }
    const ditheredKey = photo.objectKey.replace(/[^/]+$/u, crypto.randomUUID())
    await upload(dependencies.photoStorage, ditheredKey, png)
    const replaced = await dependencies.eventsStorage.replacePhotoKey(
        photo.id,
        photo.objectKey,
        ditheredKey,
    )
    await dependencies.photoStorage.deleteObject(replaced ? photo.objectKey : ditheredKey)
    return replaced ? "dithered" : "changed-meanwhile"
}

/**
 * @description Dithers every stored event photo of the environment, one at a time, so the bucket and the database see one write at once
 * @throws When the environment or an option is invalid, or a read or a write fails
 */
const main = async (): Promise<void> => {
    const { values } = parseArgs({
        options: { "dry-run": { type: "boolean", default: false } },
    })
    const env = parseEnv(process.env)
    const eventsStorage = new EventsStorage(
        buildDbInstance({ url: env.DATABASE_URL, authToken: env.DATABASE_AUTH_TOKEN }),
    )
    const photoStorage = new S3ObjectStorage({
        bucket: env.S3_BUCKET,
        region: env.S3_REGION,
        endpoint: env.S3_ENDPOINT,
        accessKeyId: env.S3_ACCESS_KEY,
        secretAccessKey: env.S3_SECRET_KEY,
    })

    const photos = await eventsStorage.listPhotos()
    const outcomes = await photos.reduce<Promise<PhotoOutcome[]>>(
        async (previous, photo) => {
            const done = await previous
            const outcome = await ditherStoredPhoto(
                { eventsStorage, photoStorage },
                photo,
                values["dry-run"],
            )
            console.info(`${outcome}: ${photo.objectKey}`)
            return [...done, outcome]
        },
        Promise.resolve([]),
    )
    const counts = Object.groupBy(outcomes, outcome => outcome)
    console.info(
        `${values["dry-run"] ? "Dry run. " : ""}Photos: ${String(photos.length)}, dithered: ${String(counts.dithered?.length ?? 0)}, already dithered: ${String(counts.skipped?.length ?? 0)}, changed meanwhile: ${String(counts["changed-meanwhile"]?.length ?? 0)}.`,
    )
}

main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : String(error))
    console.error(`\n${USAGE}`)
    process.exitCode = 1
})
