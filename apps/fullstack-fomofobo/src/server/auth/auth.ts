import "server-only"
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { APIError } from "better-auth/api"
import { nextCookies } from "better-auth/next-js"
import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH } from "models"
import type { DbInstanceFromSchema } from "storage"
import {
    AccountsStorage,
    accounts,
    authCredentials,
    authRateLimits,
    authSessions,
    authVerifications,
} from "storage"

export interface AuthSettings {
    baseUrl: string
    secret: string
    secureCookies: boolean
    rateLimitEnabled: boolean
}

/**
 * @description Builds the wrong-password error of the library, which a blocked account
 * answers too
 * @remarks Repeats the code and the message of the library by hand
 */
const invalidCredentialsError = (): APIError =>
    APIError.from("UNAUTHORIZED", {
        code: "INVALID_EMAIL_OR_PASSWORD",
        message: "Invalid email or password",
    })

/**
 * @description Builds the auth library instance over the database
 * @param db Database of the process
 * @param settings Origin, secret and environment flags
 * @remarks Writes a refreshed session cookie through the Next cookie store, which a route
 * handler and a Server Action carry onto their response
 */
export const buildAuth = (db: DbInstanceFromSchema, settings: AuthSettings) => {
    const accountsStorage = new AccountsStorage(db)

    return betterAuth({
        appName: "fomofobo",
        baseURL: settings.baseUrl,
        secret: settings.secret,
        database: drizzleAdapter(db, {
            provider: "sqlite",
            schema: {
                accounts,
                authSessions,
                authCredentials,
                authVerifications,
                authRateLimits,
            },
        }),
        user: {
            modelName: "accounts",
            additionalFields: {
                role: { type: "string", required: true, input: false },
                isBlocked: {
                    type: "boolean",
                    required: true,
                    defaultValue: false,
                    input: false,
                },
            },
        },
        session: { modelName: "authSessions", fields: { userId: "accountId" } },
        account: {
            modelName: "authCredentials",
            fields: { userId: "accountId", accountId: "providerAccountId" },
        },
        verification: { modelName: "authVerifications" },
        emailAndPassword: {
            enabled: true,
            disableSignUp: true,
            minPasswordLength: MIN_PASSWORD_LENGTH,
            maxPasswordLength: MAX_PASSWORD_LENGTH,
        },
        // Library default: 3 sign-ins per 10 s per IP
        rateLimit: {
            enabled: settings.rateLimitEnabled,
            storage: "database",
            modelName: "authRateLimits",
        },
        advanced: {
            useSecureCookies: settings.secureCookies,
            cookiePrefix: "fomofobo",
            database: { generateId: () => crypto.randomUUID() },
        },
        databaseHooks: {
            session: {
                create: {
                    before: async session => {
                        const account = await accountsStorage.findById(session.userId)
                        if (account === null || account.isBlocked) {
                            throw invalidCredentialsError()
                        }
                    },
                },
            },
        },
        // Last plugin: it writes the cookies the other plugins set
        plugins: [nextCookies()],
    })
}

export type Auth = ReturnType<typeof buildAuth>
