import "server-only"
import { S3ObjectStorage } from "backend-shared"
import { memoize } from "es-toolkit"
import type { DbInstanceFromSchema } from "storage"
import {
    AccountsStorage,
    buildDbInstance,
    CategoriesStorage,
    EventsStorage,
    PublicOccurrencesStorage,
    RateLimitsStorage,
    SavesStorage,
    SettingsStorage,
    VenuesStorage,
} from "storage"

import type { Auth } from "./auth/auth"
import { buildAuth } from "./auth/auth"
import type { AppConfig } from "./config/app-config"
import { resolveAppConfig } from "./config/app-config"
import { parseEnv } from "./config/env"
import { GeoapifyProvider } from "./geocoding/geoapify-provider"
import { AuthAccountsService } from "./services/auth-accounts-service"
import { CategoriesService } from "./services/categories-service"
import { EventsService } from "./services/events-service"
import { OrganizersService } from "./services/organizers-service"
import { PhotosService } from "./services/photos-service"
import { PlacesService } from "./services/places-service"
import { PublicOccurrencesService } from "./services/public-occurrences-service"
import { PublicSavesService } from "./services/public-saves-service"
import { PublicVenuesService } from "./services/public-venues-service"
import { SettingsService } from "./services/settings-service"
import { VenuesService } from "./services/venues-service"

export interface Container {
    appConfig: AppConfig
    db: DbInstanceFromSchema
    auth: Auth
    authAccounts: AuthAccountsService
    categories: CategoriesService
    venues: VenuesService
    organizers: OrganizersService
    events: EventsService
    photos: PhotosService
    occurrences: PublicOccurrencesService
    places: PlacesService
    publicVenues: PublicVenuesService
    saves: PublicSavesService
    settings: SettingsService
}

/**
 * @description Builds the dependencies the API handlers read
 * @throws When the environment misses a variable of its `APP_ENV` variant
 */
const buildContainer = (): Container => {
    const env = parseEnv(process.env)
    const appConfig = resolveAppConfig(env.APP_ENV)
    const db = buildDbInstance({
        url: env.DATABASE_URL,
        authToken: env.DATABASE_AUTH_TOKEN,
    })

    const auth = buildAuth(db, {
        baseUrl: env.APP_BASE_URL,
        secret: env.BETTER_AUTH_SECRET,
        secureCookies: appConfig.secureCookies,
        rateLimitEnabled: appConfig.authRateLimitEnabled,
    })

    const accountsStorage = new AccountsStorage(db)
    const categoriesStorage = new CategoriesStorage(db)
    const photoStorage = new S3ObjectStorage({
        bucket: env.S3_BUCKET,
        region: env.S3_REGION,
        endpoint: env.S3_ENDPOINT,
        accessKeyId: env.S3_ACCESS_KEY,
        secretAccessKey: env.S3_SECRET_KEY,
    })
    const authAccounts = new AuthAccountsService(auth, accountsStorage)
    const occurrencesStorage = new PublicOccurrencesStorage(db)
    const photos = new PhotosService(photoStorage)
    const settings = new SettingsService(new SettingsStorage(db))
    const savesStorage = new SavesStorage(db)
    const rateLimitsStorage = new RateLimitsStorage(db)
    const occurrences = new PublicOccurrencesService(
        occurrencesStorage,
        savesStorage,
        settings,
        env.PHOTOS_PUBLIC_BASE_URL,
        new URL("/fallbacks/", env.APP_BASE_URL).href,
    )

    return {
        appConfig,
        db,
        auth,
        authAccounts,
        organizers: new OrganizersService(authAccounts, accountsStorage),
        categories: new CategoriesService(
            categoriesStorage,
            photos,
            photoStorage,
            env.PHOTOS_PUBLIC_BASE_URL,
        ),
        venues: new VenuesService(
            new VenuesStorage(db),
            accountsStorage,
            categoriesStorage,
            photos,
            photoStorage,
            env.PHOTOS_PUBLIC_BASE_URL,
        ),
        events: new EventsService(
            new EventsStorage(db),
            savesStorage,
            photoStorage,
            env.PHOTOS_PUBLIC_BASE_URL,
        ),
        photos,
        occurrences,
        publicVenues: new PublicVenuesService(
            occurrencesStorage,
            occurrences,
            env.PHOTOS_PUBLIC_BASE_URL,
        ),
        places: new PlacesService(
            new GeoapifyProvider({
                baseUrl: env.GEOAPIFY_BASE_URL,
                apiKey: env.GEOAPIFY_API_KEY,
            }),
            rateLimitsStorage,
            occurrencesStorage,
        ),
        saves: new PublicSavesService(savesStorage, rateLimitsStorage, occurrences),
        settings,
    }
}

/**
 * @description Returns the dependencies, building them on the first call
 * @remarks Caches a successful build only, so a boot failure reports its real cause on
 * every request
 */
export const getContainer = memoize(buildContainer)
