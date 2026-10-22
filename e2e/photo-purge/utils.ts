import path from "node:path"

import { faker } from "@faker-js/faker"
import { S3ObjectStorage } from "backend-shared"
import { exec, ROOT_DIR } from "e2e-kit/infra"
import { categoryIconValues } from "models"
import type { StoredOccurrence } from "storage"
import { accounts, buildDbInstance, categories, EventsStorage, venues } from "storage"

const HOUR_MS = 60 * 60 * 1000
const PHOTO_BYTES = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])

/**
 * @description Returns a variable that the global setup published
 * @param name Variable read
 * @throws When the global setup did not run
 */
const publishedEnv = (name: string): string => {
    const value = process.env[name]
    if (value === undefined || value === "") {
        throw new Error(`No ${name} in the environment: the global setup did not run`)
    }
    return value
}

export const testDb = buildDbInstance({
    url: publishedEnv("DATABASE_URL"),
    authToken: undefined,
})

export const photoStorage = new S3ObjectStorage({
    bucket: publishedEnv("S3_BUCKET"),
    region: publishedEnv("S3_REGION"),
    endpoint: publishedEnv("S3_ENDPOINT"),
    accessKeyId: publishedEnv("S3_ACCESS_KEY"),
    secretAccessKey: publishedEnv("S3_SECRET_KEY"),
})

/**
 * @description Returns the instant a number of days from now, negative for the past
 * @param days Offset in days
 */
export const daysFromNow = (days: number): Date =>
    new Date(Date.now() + days * 24 * HOUR_MS)

/**
 * @description Builds an occurrence of two hours that ends at the instant
 * @param endsAt End of the occurrence
 */
const buildOccurrence = (endsAt: Date): StoredOccurrence => ({
    localDate: endsAt.toISOString().slice(0, 10),
    startsAt: new Date(endsAt.getTime() - 2 * HOUR_MS),
    endsAt,
})

/**
 * @description Persists an organizer, a venue and a category, uploads two photos, and persists an event with one occurrence per end
 * @param occurrenceEnds End of each occurrence, one per day at most
 */
export const seedEventWithPhotos = async (
    occurrenceEnds: Date[],
): Promise<{ eventId: string; photoKeys: string[] }> => {
    const at = new Date()
    const organizerId = crypto.randomUUID()
    const venueId = crypto.randomUUID()
    const categoryId = crypto.randomUUID()
    await testDb.batch([
        testDb.insert(accounts).values({
            id: organizerId,
            name: faker.person.fullName(),
            email: `${crypto.randomUUID()}@example.com`,
            role: "organizer",
            createdAt: at,
            updatedAt: at,
        }),
        testDb.insert(venues).values({
            id: venueId,
            name: faker.company.name(),
            address: faker.location.streetAddress(),
            latitude: 44.35,
            longitude: 11.71,
            createdAt: at,
            updatedAt: at,
        }),
        testDb.insert(categories).values({
            id: categoryId,
            name: `${faker.word.noun()} ${crypto.randomUUID()}`,
            icon: faker.helpers.arrayElement(categoryIconValues),
            createdAt: at,
        }),
    ])

    const photoKeys = [crypto.randomUUID(), crypto.randomUUID()].map(
        id => `events/${organizerId}/${id}`,
    )
    await Promise.all(
        photoKeys.map(async key => {
            const upload = await photoStorage.createUploadUrl(
                key,
                "image/png",
                PHOTO_BYTES.length,
            )
            const response = await fetch(upload.url, {
                method: "PUT",
                headers: upload.headers,
                body: PHOTO_BYTES,
            })
            if (!response.ok) {
                throw new Error(
                    `Photo upload failed with status ${String(response.status)}`,
                )
            }
        }),
    )

    const eventId = crypto.randomUUID()
    const [first] = occurrenceEnds
    const firstStart = first === undefined ? at : buildOccurrence(first).startsAt
    await new EventsStorage(testDb).insertWithChildren(
        {
            id: eventId,
            organizerId,
            venueId,
            title: faker.lorem.words(3),
            description: null,
            startsAt: firstStart.toISOString().slice(0, 16),
            endsAt: (first ?? at).toISOString().slice(0, 16),
            recurrence: null,
            instagramUrl: null,
            facebookUrl: null,
            priceScheme: {
                isFree: true,
                fullPriceCents: null,
                reducedPrices: [],
                membership: null,
                minimumAge: null,
                notes: null,
            },
            capacity: null,
            categoryIds: [categoryId],
            primaryCategoryId: categoryId,
            photos: photoKeys.map((objectKey, position) => ({
                id: crypto.randomUUID(),
                objectKey,
                position,
            })),
            occurrences: occurrenceEnds.map(buildOccurrence),
        },
        at,
    )
    return { eventId, photoKeys }
}

/**
 * @description Runs the purge job on the database file and the bucket of the suite
 * @throws When the job exits non-zero
 */
export const runPurge = (): void => {
    exec("pnpm purge", "Photo purge", path.resolve(ROOT_DIR, "apps/photo-purge"))
}
